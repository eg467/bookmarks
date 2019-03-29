using Newtonsoft.Json;
using System;
using System.Configuration;
using System.Dynamic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace ApiProxy.Controllers
{
    [RoutePrefix("api/pocketproxy")]
    public class PocketProxyController : ApiController
    {
        private string UriFromPage(string page) => $"https://getpocket.com/v3/{page}";
        private string ConsumerKey => ConfigurationManager.AppSettings["PocketConsumerKey"];

        [HttpPost]
        [Route("{*page}", Name = "Proxy")]
        public async Task<object> Proxy([FromBody] ExpandoObject content, string page)
        {
            return await TryMakeCall(page, content);
        }

        private async Task<HttpResponseMessage> TryMakeCall(string page, object requestModel)
        {
            try
            {
                return await MakeCall(page, requestModel);
            }
            catch (HttpException exc)
            {
                return Request.CreateErrorResponse((HttpStatusCode)exc.GetHttpCode(), exc);
            }
            catch (Exception exc)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, exc);
            }
        }


        private HttpClient CreateClient()
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Add("X-Accept", "application/json");
            return client;
        }

        private async Task<HttpResponseMessage> MakeCall(string page, dynamic body)
        {
            var client = CreateClient();
            var uri = UriFromPage(page);
            body.consumer_key = ConsumerKey;

            //var requestContent = JsonConvert.SerializeObject(body);
            //var stringContent = new StringContent(requestContent, Encoding.UTF8, "application/json");
            //var response = await client.PostAsync(uri, stringContent);
            var response = await client.PostAsJsonAsync(uri, (object)body);
            if (!response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                throw new HttpException((int)response.StatusCode, content);
            }

            var httpResponse = await response.Content.ReadAsAsync<object>();
            return Request.CreateResponse(HttpStatusCode.OK, httpResponse);
        }



    }
}
