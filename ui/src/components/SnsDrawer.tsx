import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LineIcon } from './LineIcon';
import { DiscordIcon } from './DiscordIcon';
import { XIcon } from './XIcon';
import { InstagramIcon } from './InstagramIcon';

interface SnsDrawerProps {
  triggerButton: React.ReactNode;
}

export function SnsDrawer({ triggerButton }: SnsDrawerProps) {
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        {triggerButton}
      </DrawerTrigger>

      <DrawerContent className="bg-white">
        <DrawerHeader>
          <DrawerTitle>SNS</DrawerTitle>
          <DrawerDescription>
            質問・相談・雑談などお気軽にどうぞ！
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4">
          <div className="flex justify-center gap-4 flex-wrap">
            <LineIcon 
              url="https://line.me/ti/g2/O2tQ-ged5dKgz9QLHtrT7eTOMa93BuZoyojyJg?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
              className="transform hover:scale-110"
            />
            <DiscordIcon 
              url="https://discord.com/invite/gj9aXgFTp5"
              className="transform hover:scale-110"
            />
            <XIcon 
              url="https://twitter.com/yzmanken"
              className="transform hover:scale-110"
            />
            <InstagramIcon 
              url="https://www.instagram.com/yamadai_manken?igsh=ZHlnaGZ5MDdzazls"
              className="transform hover:scale-110"
            />
          </div>
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              閉じる
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}