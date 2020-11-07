using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;

namespace Bookmarks.Controllers
{
    //[Route("api/[controller]")]
    [Route("api/pocket")]
    [ApiController]
    public class PocketController : ControllerBase
    {
        private readonly ILogger<PocketController> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _consumerKey;

        public PocketController(ILogger<PocketController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _consumerKey = _configuration.GetValue<string>("PocketConsumerKey");
            _client.AddDefaultHeaders(DefaultApiHeaders());
        }

        private readonly RestClient _client = new RestClient("https://getpocket.com/v3");

        private Dictionary<string, string> DefaultApiHeaders() =>
            new Dictionary<string, string>() {
                {"X-Accept", "application/json"}
            };

        ////private dynamic AddConsumerKeyToBody(dynamic body)
        ////{
        ////    body.consumer_key = _consumerKey;
        ////    return body;
        ////}

        [HttpPost]
        [Route("{*page}", Name = "Proxy")]
        public async Task<ProxyReponse> Proxy([FromBody] ExpandoObject content, string page)
        {
            content.TryAdd("consumer_key", _consumerKey);
            var x = System.Text.Json.JsonSerializer.Serialize(content);

            var request = new RestRequest(page, DataFormat.Json)
            {
                Method = Method.POST,
            };
            request.AddHeader("Accept", "*/*");
            request.AddHeader("Content-Type", "application/json");
            request.AddParameter(
                "application/json; charset=utf-8",
                x,
                ParameterType.RequestBody);

            IRestResponse<object> response = await _client.ExecutePostAsync<object>(request);

            if (!response.IsSuccessful)
                _logger.LogError($"Pocket API Response ({response.StatusCode}): {response.Content}");

            return new ProxyReponse
            {
                Data = response.Data,
                HttpCode = (int)response.StatusCode,
                Success = response.IsSuccessful
            };
        }
    }

    public class ProxyReponse
    {
        public object Data { get; set; }
        public int HttpCode { get; set; }
        public bool Success { get; set; }
    }
}