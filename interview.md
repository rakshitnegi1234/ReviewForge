# Interview Q&A Notes

## React Query / TanStack Query

### 1. `useQuery`, `useMutation`, aur `useInfiniteQuery` me kya difference hai?

`useQuery` data read/fetch karne ke liye hota hai, jaise repositories list DB/API se lana.

`useMutation` create/update/delete/action ke liye hota hai, jaise repository connect karna.

`useInfiniteQuery` paginated ya infinite-scroll data ke liye hota hai, jaise "Load more repositories".

Example:

```ts
useQuery({
  queryKey: ["repositories"],
  queryFn: getRepositories,
});
```

```ts
useMutation({
  mutationFn: connectRepository,
});
```

Interview answer:

> I use `useQuery` for server state reads, `useMutation` for writes or side effects, and `useInfiniteQuery` when the data is split into pages. After a mutation succeeds, I usually invalidate the related query key so the UI refetches fresh data.

### 2. `const { mutate: connectRepo } = useConnectRepository()` ka kya matlab hai?

Yahan `connectRepo` data nahi hai. Ye `mutate` function ka renamed version hai.

```ts
const { mutate: connectRepo } = useConnectRepository();
```

Matlab:

```ts
const result = useConnectRepository();
const connectRepo = result.mutate;
```

Actual mutation tab chalegi jab call karoge:

```ts
connectRepo({
  owner,
  repo,
  githubId,
});
```

Interview answer:

> `useConnectRepository` returns a mutation object. I rename its `mutate` function to `connectRepo` for readability. The hook sets up the mutation, but the actual API call only runs when `connectRepo(input)` is called.

### 3. `mutate` aur `mutateAsync` me kya difference hai?

`mutate` callback style me kaam karta hai.

```ts
connectRepo(input, {
  onSuccess: (data) => {
    console.log(data);
  },
});
```

`mutateAsync` promise return karta hai, isliye `await` kar sakte ho.

```ts
const data = await connectRepoAsync(input);
```

Interview answer:

> `mutate` starts the mutation and uses callbacks like `onSuccess` and `onError`. `mutateAsync` returns a promise, so I use it when I need `await`, try/catch, or sequential async logic.

### 4. Mutation ka returned data kahan milta hai?

Ye galat assumption hai:

```ts
const { mutate: connectRepo } = useConnectRepository();
```

`connectRepo` ke andar returned data store nahi hota. Data yahan milta hai:

```ts
const {
  mutate: connectRepo,
  data: connectedRepo,
} = useConnectRepository();
```

Ya `onSuccess` me:

```ts
connectRepo(input, {
  onSuccess: (data) => {
    console.log(data);
  },
});
```

Interview answer:

> The mutation result is available in the mutation object's `data` field, or directly in the `onSuccess` callback. The `mutate` function itself is only used to trigger the mutation.

### 5. `invalidateQueries({ queryKey: ["repositories"] })` kya karta hai?

Ye `["repositories"]` query ke cached data ko stale mark karta hai. Agar query active hai, to React Query uska `queryFn` dobara run karke fresh data fetch karega.

```ts
queryClient.invalidateQueries({
  queryKey: ["repositories"],
});
```

Interview answer:

> After connecting a repository, the cached repositories list may be outdated. I invalidate the `["repositories"]` query so React Query refetches it and the UI shows the latest database state.

### 6. `queryKey` ka role kya hota hai?

`queryKey` cache identity hoti hai. React Query isi key ke basis par decide karta hai ki kaunsa data cache me rakha hai.

```ts
queryKey: ["repositories"]
```

Parameterized query:

```ts
queryKey: ["repositories", githubId]
```

Interview answer:

> A query key uniquely identifies cached server state. If the key changes, React Query treats it as a different query. I include parameters like user id, repo id, or filters in the key so caching stays correct.

## Auth / NextAuth / Better Auth Style

### 7. `auth.ts` file me usually kya hota hai?

`auth.ts` me auth configuration hoti hai:

- provider setup, jaise GitHub OAuth
- callbacks, jaise `jwt` aur `session`
- token/session customization
- helper functions to get current user/session

Interview answer:

> I keep auth configuration in `auth.ts`. It defines the OAuth provider, callbacks, and session behavior. For GitHub login, I capture the access token during sign-in and expose only the required user/session fields to the app.

### 8. GitHub OAuth flow ka high-level process kya hai?

Flow:

1. User GitHub se login karta hai.
2. GitHub app ko authorization code deta hai.
3. Auth library code exchange karke access token leti hai.
4. App token ko JWT/session ya DB account record me store karti hai.
5. Server GitHub API calls ke liye token use karta hai.

Interview answer:

> The user signs in with GitHub OAuth. The auth library exchanges the authorization code for an access token. I store that token securely on the server side or in the auth account/session flow, then use it to call GitHub APIs on behalf of the user.

### 9. GitHub access token client side par rakhna chahiye?

Usually nahi. Token server side par rakhna better hai.

Reason:

- token leak hone ka risk kam hota hai
- GitHub API calls server actions/API routes se controlled hoti hain
- permissions validate karna easy hota hai

Interview answer:

> I avoid exposing provider access tokens to the browser unless there is a strong reason. I prefer calling GitHub from server-side code, where I can validate the session and control what operations are allowed.

### 10. Session callback aur JWT callback ka use kya hai?

JWT callback token ke andar data store/update karne ke liye hota hai.

Session callback client ko exposed session shape control karta hai.

Example concept:

```ts
callbacks: {
  jwt({ token, account }) {
    if (account?.access_token) {
      token.githubAccessToken = account.access_token;
    }

    return token;
  },

  session({ session, token }) {
    session.user.id = token.sub;
    return session;
  },
}
```

Interview answer:

> I use the JWT callback to persist auth-related values in the token, and the session callback to decide what safe data should be exposed to the client. I avoid exposing sensitive provider tokens unless the UI absolutely needs them.

## Octokit / GitHub API

### 11. Octokit kya hai?

Octokit GitHub API client hai. Isse GitHub REST API calls karte hain.

```ts
const octokit = new Octokit({
  auth: githubAccessToken,
});
```

Interview answer:

> Octokit is GitHub's API client. I initialize it with the authenticated user's GitHub access token, then use it to fetch user info, validate repository access, or read repository metadata.

### 12. `octokit.rest.users.getAuthenticated()` type functions yaad rakhna zaroori hai?

Exact method names yaad hona zaroori nahi. Concept important hai.

Interview answer:

> I do not memorize every Octokit method name, but I know the flow. I initialize Octokit with the user's GitHub token, call the relevant GitHub endpoint to verify identity or repository access, and then persist the validated data in my database.

### 13. Repository connect karte time GitHub API kyun call karte hain?

Reasons:

- repo exist karti hai ya nahi check karna
- user ke paas access hai ya nahi verify karna
- repo metadata lena, jaise name, full name, private/public, default branch
- wrong input ya unauthorized connection prevent karna

Interview answer:

> Before saving a connected repository, I validate it with GitHub. That prevents storing fake or inaccessible repositories and lets me save trusted metadata like repo id, owner, name, default branch, and visibility.

### 14. Repository connect ka complete flow kya hai?

Flow:

1. User GitHub se authenticated hai.
2. User repo owner/name select karta hai.
3. UI `connectRepo({ owner, repo, githubId })` mutation call karta hai.
4. Server current session validate karta hai.
5. Server GitHub token se Octokit initialize karta hai.
6. Server GitHub API se repo access verify karta hai.
7. Server repository DB me save karta hai.
8. Mutation success par `["repositories"]` invalidate hoti hai.
9. UI latest repositories list refetch karta hai.

Interview answer:

> The client only triggers the connect action. The server validates the logged-in user, uses the user's GitHub token to verify repository access through GitHub, stores the connected repository in the database, and then the client invalidates the repositories query so the UI refetches the updated list.

## Error Handling

### 15. `onError` me kya karna chahiye?

User ko readable error dikhana chahiye, aur developer ke liye error log karna chahiye.

```ts
onError: (error) => {
  toast.add({
    title: "Failed to connect repository",
    type: "error",
  });

  console.error(error);
}
```

Interview answer:

> On error, I show a user-friendly message and log the actual error for debugging. I avoid showing raw technical errors directly to users.

### 16. `console.err` sahi hai ya `console.error`?

Sahi method:

```ts
console.error(error);
```

`console.err` JavaScript console ka standard method nahi hai.

Interview answer:

> The correct method is `console.error`. `console.err` is a typo and can fail because it is not a standard console method.

## Architecture Questions

### 17. Client aur server responsibilities kaise split karoge?

Client:

- form/input manage karega
- mutation trigger karega
- loading/error UI dikhayega
- query invalidate/refetch karega

Server:

- session validate karega
- token securely use karega
- GitHub API call karega
- DB write karega
- authorization enforce karega

Interview answer:

> I keep sensitive work on the server. The client triggers the mutation and updates UI state, while the server validates auth, uses the GitHub token, checks permissions, and writes to the database.

### 18. DB me connected repository save karte waqt kya fields useful hain?

Useful fields:

- GitHub repo id
- owner
- repo name
- full name
- default branch
- private/public
- connected user id
- installation id, agar GitHub App use ho raha hai

Interview answer:

> I store stable GitHub identifiers, not just names, because repo names can change. I also store the user relation and useful metadata like owner, repo name, default branch, and visibility.

### 19. Same repository duplicate connect na ho, kaise prevent karoge?

DB level par unique constraint lagana best hai.

Example concept:

```prisma
@@unique([userId, githubRepoId])
```

Interview answer:

> I prevent duplicates at the database level with a unique constraint, usually on user id and GitHub repo id. UI checks are useful, but DB constraints are the real protection against race conditions.

### 20. Exact library functions yaad na ho to interview me kaise answer karna chahiye?

Good answer:

> I may not remember the exact method name from memory, but I understand the flow. I would check the library docs for the exact Octokit method, initialize the client with the authenticated token, verify repository access, and then persist the result in the database.

Ye answer acceptable hota hai because interviewer ko mostly ye dekhna hota hai:

- architecture clear hai ya nahi
- auth/security samajh aati hai ya nahi
- data fetching and cache invalidation samajh aata hai ya nahi
- docs use karna aata hai ya nahi
