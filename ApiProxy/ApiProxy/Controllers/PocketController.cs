using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace ApiProxy.Controllers
{

    // TODO: REMOVE

#if DEBUG
    [EnableCors(origins: "*", headers: "*", methods: "*")]
#endif
    [RoutePrefix("api/pocket")]
    public class PocketController : ApiController
    {
        public class RequestTokenInputModel
        {
            /// <summary>
            /// The URL the user will need to visit to grant the API account access.
            /// </summary>
            public string redirect_uri { get; set; }
        }

        [HttpGet]
        [Route("Test", Name = "Test")]
        public string Test()
        {
            return "success";
        }

        [HttpPost]
        [Route("OAuth/Request", Name = "GetRequestToken")]
        public async Task<ResponseModel> GetRequestToken([FromBody]RequestTokenInputModel model)
        {
            var response = await TryMakeCall("oauth/request", model);
            if (!response.HasError)
            {
                response.Content.url = $"https://getpocket.com/auth/authorize?request_token={response.Content.code}&redirect_uri={model.redirect_uri}";
            }
            return response;
        }

        public class AccessTokenInputModel
        {
            public string code { get; set; }
        }

        [HttpPost]
        [Route("OAuth/authorize", Name = "ExchangeRequestTokenForAccessToken")]
        public async Task<ResponseModel> ExchangeRequestTokenForAccessToken([FromBody]AccessTokenInputModel model)
        {
            return await TryMakeCall("oauth/authorize", model);
        }

        public class RetrievalRequest
        {
            public string access_token { get; set; }
            public string state { get; set; }
            public string favorite { get; set; }
            public string tag { get; set; }
            public string contentType { get; set; }
            public string sort { get; set; }
            public string detailType { get; set; }
            public string search { get; set; }
            public string domain { get; set; }
            public int? since { get; set; }
            public int? count { get; set; }
            public int? offset { get; set; }
        }

        [HttpPost]
        [Route("Get", Name = "RetrieveBookmarks")]
        public async Task<ResponseModel> RetrieveBookmarks([FromBody] RetrievalRequest model)
        {
            return await TryMakeCall("get", model);
        }

        public enum ActionType
        {
            add, archive, readd, favorite, unfavorite, delete, tags_add, tags_remove, tags_replace, tags_clear, tag_rename
        }

        public class ActionRequest
        {
            [JsonConverter(typeof(StringEnumConverter))]
            public ActionType action { get; set; }
            public int? item_id { get; set; }
            public int? ref_id { get; set; }
            public string tags { get; set; }
            public string old_tag { get; set; }
            public string new_tag { get; set; }
            public int? time { get; set; }
            public string title { get; set; }
            public string url { get; set; }
        }
        public class ModifyRequest
        {
            public string access_token { get; set; }
            public ActionRequest[] actions { get; set; }
        }

        [HttpPost]
        [Route("Send", Name = "ModifyBookmarks")]
        public async Task<ResponseModel> ModifyBookmarks([FromBody] ModifyRequest model)
        {
            return await TryMakeCall("send", model);
        }

        public class ResponseModel
        {
            public dynamic Content { get; set; }
            public int Code { get; set; }
            public string Error { get; set; }
            public bool HasError => !string.IsNullOrEmpty(Error);

        }

        private HttpClient CreateClient()
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Add("X-Accept", "application/json");
            return client;
        }

        private async Task<ResponseModel> TryMakeCall(string page, object requestModel)
        {
            try
            {
                return await MakeCall(page, requestModel);
            }
            catch (HttpException exc)
            {
                return new ResponseModel { Error = exc.Message, Code = exc.GetHttpCode() };
            }
            catch (Exception exc)
            {
                return new ResponseModel { Error = exc.Message, Code = (int)HttpStatusCode.InternalServerError };
            }
        }

        private async Task<ResponseModel> MakeCall(string page, object body)
        {
            var client = CreateClient();
            var uri = UriFromPage(page);
            var standardizedBody = AddDefaultProperties(body);
            var requestContent = JsonConvert.SerializeObject(standardizedBody);
            var stringContent = new StringContent(requestContent, Encoding.UTF8, "application/json");
            var response = await client.PostAsync(uri, stringContent);
            return await ProcessResponse(response);
        }

        private async Task<ResponseModel> ProcessResponse(HttpResponseMessage response)
        {
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var code = (int)response.StatusCode;
                throw new HttpException(code, responseContent);
            }

            return new ResponseModel()
            {
                Content = JObject.Parse(responseContent),
                Code = (int)response.StatusCode,
            };
        }

        private string UriFromPage(string page)
        {
            return $"https://getpocket.com/v3/{page}";
        }

        /// <summary>
        /// Add properties here that need to be sent with every request.
        /// </summary>
        /// <param name="requestBody"></param>
        /// <returns></returns>
        private dynamic AddDefaultProperties(dynamic requestBody)
        {
            dynamic x = CreateExpandoFromObject(requestBody);
            x.consumer_key = ConfigurationManager.AppSettings["PocketConsumerKey"];
            return x;
        }

        private static ExpandoObject CreateExpandoFromObject(object source)
        {
            // From: https://stackoverflow.com/questions/36686408/dynamically-adding-properties-to-an-object-from-an-existing-static-object-in-c-s
            // Not the most efficient approach.

            var result = new ExpandoObject();
            IDictionary<string, object> dictionary = result;
            foreach (var property in source
                .GetType()
                .GetProperties()
                .Where(p => p.CanRead && p.GetMethod.IsPublic && p.GetValue(source) != null))
            {
                dictionary[property.Name] = property.GetValue(source, null);
            }
            return result;
        }
    }
}
