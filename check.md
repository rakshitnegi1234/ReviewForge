
```

## 3. Contribution graph frontend se data kaise fetch kar raha hai?

Contribution graph file:

```ts
module/dashboard/components/contributions-graph.tsx
```

Yaha bhi `useQuery` use ho raha hai:

```ts
const { data, isLoading } = useQuery({
  queryKey: ["contribution-stats"],
  queryFn: async () => {
    const contributions = ((await getContributionStats()) ?? []);

    return {
      contributions,
      totalContributions: contributions.reduce((total, day) => total + day.count, 0),
    };
  },
  staleTime: 1000 * 60 * 5,
});
```

Yaha frontend `getContributionStats()` server action call karta hai.

Server action GitHub se contribution data fetch karta hai.

Frontend us data ko `ActivityCalendar` ko pass karta hai:

```tsx
<ActivityCalendar data={data.contributions} />
```

## Full Flow

```txt
Dashboard UI
  -> useQuery()
  -> server action call
  -> auth session check
  -> database se GitHub token
  -> GitHub API call
  -> data transform
  -> frontend ko return
  -> UI mein render
```

Important:

```txt
GitHub token browser mein expose nahi hota.
Token sirf server action ke andar use hota hai.
Frontend ko sirf final safe data milta hai.
```
