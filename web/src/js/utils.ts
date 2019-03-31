export const SetOps = {
   union: <T>(a: Set<T>, b: Set<T>) => new Set([...a, ...b]),
   intersection: <T>(a: Set<T>, b: Set<T>) =>
      new Set([...a].filter(x => b.has(x))),
   difference: <T>(a: Set<T>, b: Set<T>) =>
      new Set([...a].filter(x => !b.has(x))),
   map: <T, TDest>(set: Set<T>, fn: (x: T) => TDest) =>
      new Set([...set].map(fn)),
   reduce: <T>(sets: Set<T>[], fn: (a: Set<T>, b: Set<T>) => Set<T>) =>
      sets.length ? sets.reduce(fn) : new Set<T>()
};

export function filterObject(
   obj: { [key: string]: any },
   filter: (k: string, v: any) => boolean
) {
   const copy: any = {};
   Object.keys(obj).forEach(k => {
      const v = obj[k];
      if (filter(k, v)) {
         copy[k] = v;
      }
   });
   return copy;
}

export function def<T>(obj: any, key: string, def: T | (() => T)) {
   return (
      obj[key] ||
      (obj[key] = typeof def === "function" ? (<() => T>def)() : def)
   );
}

export function toast(
   content: string,
   settings: {
      isHtml?: boolean;
      title?: string;
      delay?: number;
      type?:
         | "info"
         | "danger"
         | "success"
         | "warning"
         | "primary"
         | "secondary";
   } = {}
) {
   settings = $.extend(
      {
         isHtml: false,
         title: "Bookmarks",
         delay: 5000,
         type: "secondary"
      },
      settings
   );

   const colorClasses = {
      info: "bg-info text-light",
      danger: "bg-danger text-light",
      success: "bg-success text-light",
      warning: "bg-warning text-light",
      primary: "bg-primary text-light",
      secondary: "bg-secondary text-light"
   }[settings.type];

   const $toast = $(
      `<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
         <div class="${colorClasses} toast-header">
         <strong class="mr-auto"></strong>
         <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
         </button>
         </div>
         <div class="toast-body"></div>
      </div>`
   ).appendTo($(".toast-container"));

   $toast.find("strong").text(settings.title);
   const $body = $toast.find(".toast-body");
   settings.isHtml ? $body.html(content) : $body.text(content);

   $toast
      .toast({
         delay: settings.delay
      })
      .toast("show");
}

// export function showAlert(message: string, type: string, closeDelay: number) {
//    //stackoverflow.com/questions/8965018/dynamically-creating-bootstrap-css-alert-messages
//    https: var $cont = $("#alerts-container");

//    if ($cont.length == 0) {
//       // alerts-container does not exist, create it
//       $("body").append(
//          $(
//             '<div id="alerts-container" style="position: fixed; width: 50%; left: 25%; top: 10%;">'
//          )
//       );
//    }

//    // default to alert-info; other options include success, warning, danger
//    type = type || "info";

//    // create the alert div
//    var alert = $('<div class="alert alert-' + type + ' fade in">')
//       .append(
//          $('<button type="button" class="close" data-dismiss="alert">').append(
//             "&times;"
//          )
//       )
//       .append(message);

//    // add the alert div to top of alerts-container, use append() to add to bottom
//    $cont.prepend(alert);

//    // if closeDelay was passed - set a timeout to close the alert
//    if (closeDelay)
//       window.setTimeout(function() {
//          alert.find('[class="close"]').click();
//       }, closeDelay);
// }

export function querystring(): { [key: string]: string } {
   const url = document.location.search;
   const re = /[?&]([^?&]+)=([^?&#]*)/g;
   let m;
   const qs: { [key: string]: string } = {};
   while ((m = re.exec(url))) {
      qs[m[1]] = m[2];
   }
   return qs;
}

export function download(filename: string, contents: string) {
   var element = document.createElement("a");

   const mimeTypes: any = {
      csv: "text/csv",
      html: "text/html",
      json: "application/json",
      txt: "text/plain"
   };
   const extension = filename.split(".").pop();
   const mimeType = mimeTypes[extension];

   element.setAttribute(
      "href",
      `data:${mimeType};charset=utf-8,${encodeURIComponent(contents)}`
   );
   element.setAttribute("download", filename);

   element.style.display = "none";
   document.body.appendChild(element);

   element.click();

   document.body.removeChild(element);
}

let modalId = 0;
export function showModal(
   $el: JQuery<HTMLElement>,
   options: {
      title: string;
      onclose: () => void;
   }
) {
   let $container = $(`
      <div class="modal fade" id="custom-modal-${++modalId}" 
         tabindex="-1" role="dialog" aria-labelledby="settings-modal-title-${modalId}"
         aria-hidden="true">
         <div class="modal-dialog modal-xl " role="document">
            <div class="modal-content">
               <div class="modal-header">
                  <h5 class="modal-title" id="settings-modal-title-${modalId}">
                     Settings
                  </h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                     <span aria-hidden="true">&times;</span>
                  </button>
               </div>
               <div class="modal-body"></div>
            </div>
         </div>
      </div>`);

   $container
      .find(".modal-title")
      .toggle(!!options.title)
      .text(options.title || "");

   $container.find(".modal-body").append($el);

   $container.find(".modal-header button.close").one("click", function(e) {
      if (options.onclose) {
         if (options.onclose) {
            options.onclose();
         }
         $container.remove();
      }
   });
}

/**
 * Executes a function if a test value is truthy.
 * @param value The value whose truthiness to test.
 * @param fn The function to execute if value is truthy.
 * @returns value
 */
export function eif<T, TResult>(value: T, fn: (v: T) => TResult): TResult {
   return value ? fn(value) : undefined;
}

(function($) {
   $.fn.findSelf = function(selector) {
      var result = this.find(selector);
      return this.is(selector) ? result.add(this) : result;
   };

   $.fn.exists = function() {
      return this.length !== 0;
   };

   $.fn.applyClass = function(className: string, apply: boolean) {
      // https://stackoverflow.com/questions/20307321/conditionally-add-class-using-jquery
      return apply
         ? $(this).addClass(className)
         : $(this).removeClass(className);
   };

   $.fn.btnclick = function(
      handler: ($sender: JQuery<HTMLElement>) => any,
      preventDefault = true,
      stopPropagation = false,
      cancelPrevious = false
   ) {
      const $this = $(this);
      eif(cancelPrevious, _ => $this.off("click"));
      return $this.click(e => {
         preventDefault && e.preventDefault();
         stopPropagation && e.stopPropagation();
         handler($this);
      });
   };
})($);
