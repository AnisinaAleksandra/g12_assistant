"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, Settings, Monitor, Minimize2, Maximize2 } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { useChatSize } from "@/hooks/use-chat-size"

export function SettingsMenu() {
  const { theme, toggleTheme } = useTheme()
  const { chatSize, updateChatSize } = useChatSize()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Theme</DropdownMenuLabel>
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              Switch to Light Mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              Switch to Dark Mode
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Chat Size</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={chatSize} onValueChange={(value) => updateChatSize(value as any)}>
          <DropdownMenuRadioItem value="compact" className="cursor-pointer">
            <Minimize2 className="h-4 w-4 mr-2" />
            Compact
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="comfortable" className="cursor-pointer">
            <Monitor className="h-4 w-4 mr-2" />
            Comfortable
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="spacious" className="cursor-pointer">
            <Maximize2 className="h-4 w-4 mr-2" />
            Spacious
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
