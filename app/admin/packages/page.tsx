"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "@/lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from '@/lib/utils';
import UserPackagesData from "@/app/components/admin/packages/UserPackagesData";
import PackagesData from "@/app/components/admin/packages/PackagesData";

export default async function SettingsPage(): Promise<JSX.Element> {
    await loginIsRequiredServer();

    
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    const isAdmin = session?.user?.email === "adminlocal@demo.com" || session?.user?.email === "testacc@admin.com";

    const user = await find_user({ email: userEmail });
    



    return (
        isAdmin ? <div className="mt-5 flex flex-col items-center gap-5">
            <PackagesData />
            <UserPackagesData />
        </div> : <div>You are not authorized to access this page</div>
    );
};
