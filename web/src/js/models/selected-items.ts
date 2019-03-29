import { TypedEvent } from "../views/view";
import { SetOps } from "../utils";

export type SelectionChangedEventArgs = {
   action: "add" | "remove" | "reset";
   removedIds: Set<string>;
   addedIds: Set<string>;
};

export default class SelectedItems {
   private _selectedIds = new Set<string>();
   public selectionChangedEvent = new TypedEvent<
      SelectedItems,
      SelectionChangedEventArgs
   >(this);

   get selectedIds() {
      return new Set(this._selectedIds);
   }
   set selectedIds(ids: Set<string>) {
      this.reset([...ids]);
   }

   get length() {
      return this._selectedIds.size;
   }

   add(id: string) {
      if (this._selectedIds.has(id)) {
         return;
      }

      this._selectedIds.add(id);

      this.onChanged(<SelectionChangedEventArgs>{
         action: "remove",
         addedIds: new Set<string>([id]),
         removedIds: new Set<string>()
      });
   }

   contains(id: string) {
      return this._selectedIds.has(id);
   }

   remove(id: string) {
      if (!this._selectedIds.has(id)) {
         return;
      }

      this._selectedIds.delete(id);

      this.onChanged(<SelectionChangedEventArgs>{
         action: "remove",
         addedIds: new Set<string>(),
         removedIds: new Set<string>([id])
      });
   }

   reset(ids: string[]) {
      const removed = new Set(this._selectedIds);
      const added = new Set(ids);

      this._selectedIds = added;

      this.onChanged(<SelectionChangedEventArgs>{
         action: "reset",
         addedIds: SetOps.difference(added, removed),
         removedIds: SetOps.difference(removed, added)
      });
   }

   protected onChanged(args: SelectionChangedEventArgs) {
      this.selectionChangedEvent.trigger(args);
   }
}
