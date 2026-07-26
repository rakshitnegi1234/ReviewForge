"use client"

import { GitBranchIcon as Github, BookOpen, Settings, Moon, Sun, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Logout from "@/module/auth/components/logout"

export const AppSidebar = () => {
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const { data: session } = useSession();

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BookOpen,
    },
    {
      title: "Repository",
      url: "/dashboard/repository",
      icon: Github,
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: BookOpen,
    },
    {
      title: "Subscription",
      url: "/dashboard/subscription",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === url;
    }

    return pathname === url || pathname.startsWith(url + "/")
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !session) return null

  const user = session.user;
  const userName = user.name || "GUEST"
  const userEmail = user.email || ""
  const userInitials = userName.split(" ").map((n) => n[0]).join("").toUpperCase()

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex flex-col gap-4 px-2 py-6">
          <div className="flex items-center gap-4 px-3 py-4 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
              <Github className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground tracking-wide">Connected Account</p>
              <p className="text-sm font-medium text-sidebar-foreground/90">@{userName}</p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton render={<Link href={item.url} />} isActive={isActive(item.url)}>
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton />}>
                <Avatar size="sm">
                  <AvatarImage src={user.image || ""} alt={userName} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="truncate">{userEmail || userName}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start">
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun /> : <Moon />}
                  Toggle theme
                </DropdownMenuItem>
                <Logout className="flex w-full items-center gap-1.5">
                  <DropdownMenuItem>
                    <LogOut />
                    Logout
                  </DropdownMenuItem>
                </Logout>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
