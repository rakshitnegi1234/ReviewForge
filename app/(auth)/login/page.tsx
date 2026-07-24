
import LoginUI from "@/module/auth/components/login-ui"
import { requireUnAuth } from "@/module/auth/utils/auth-utils";

async function page() {

  await requireUnAuth();
  return (
   <>
     <LoginUI />
   </>
  )
}

export default page;
