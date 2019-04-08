import { TypedEvent } from "../views/view";

export interface SettingChangedEventArgs {
   key: string;
   value: any;
}

export class GlobalSettings {
   /**
    * This will cause memory leaks with unsubscribed short-lived objects.
    */
   public static settingChangedEvent = new TypedEvent<
      GlobalSettings,
      SettingChangedEventArgs
   >(null);

   private static settings: {
      [key: string]: any;
   } = {};

   public static setting(key: string, value?: any) {
      const origValue = GlobalSettings.settings[key];
      if (value === undefined) {
         return origValue;
      }

      if (origValue === value) {
         return;
      }

      GlobalSettings.settings[key] = value;
      GlobalSettings.settingChangedEvent.trigger({ key, value });
   }
}
