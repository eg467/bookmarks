using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;

namespace ApiProxy
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
#if DEBUG
            var cors = new EnableCorsAttribute("http://localhost:3000,https://localhost:3000,https://bookmarks.gldnr.com", "*", "*");
            config.EnableCors(cors);
#endif

            config.Formatters.JsonFormatter.SerializerSettings.Converters.Add(
                new Newtonsoft.Json.Converters.StringEnumConverter());

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{action}"
            );
        }
    }
}
