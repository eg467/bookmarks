import { View, IViewSettings, TypedEvent } from "./view";

export interface IFilterToggleEventArgs {
  key: "and" | "or" | "not" | "content";
  enabled: boolean;
}

export class FilterMenuView extends View {
  public toggleEvent = new TypedEvent<FilterMenuView, IFilterToggleEventArgs>(
    this
  );
  private filterToggledHandler: any;

  constructor(settings: IViewSettings | void) {
    super($.extend({}, settings));

    this.setupCallbacks();
    this.wireCallbacks();
  }

  private setupCallbacks() {
    this.filterToggledHandler = this.onFilterToggled.bind(this);
  }

  private wireCallbacks() {}

  protected $createRoot() {
    const filterLabels = {
      and: "All tags",
      or: "Some tags",
      not: "No tags",
      content: "Content"
    };

    return $("<div>")
      .addClass("btn-group btn-group-toggle")
      .data("toggle", "buttons")
      .append(
        $.map(filterLabels, (v, k) =>
          $("<label>")
            .addClass(" btn btn-secondary")
            .append(
              $("<input>")
                .attr("type", "checkbox")
                .attr("name", "filter-toggle")
                .attr("autocomplete", "off")
                .data("filterKey", k)
                .on("change", this.filterToggledHandler),
              $("<span>").text(v)
            )
        )
      );
  }

  private onFilterToggled(
    e: JQuery.ChangeEvent<HTMLElement, undefined, HTMLElement, HTMLElement>
  ) {
    const $sender = $(e.target);
    this.toggleEvent.trigger({
      key: $sender.data("filterKey"),
      enabled: $sender.is(":checked")
    });
  }
}
