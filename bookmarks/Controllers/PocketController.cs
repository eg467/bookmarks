using System.Collections.Generic;
using System.Dynamic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RestSharp;

namespace Bookmarks.Controllers
{
    [Route("api/pocket")]
    [ApiController]
    public class PocketController : ControllerBase
    {
        private readonly RestClient _client = new RestClient("https://getpocket.com/v3");
        private readonly IConfiguration _configuration;
        private readonly string _consumerKey;
        private readonly ILogger<PocketController> _logger;

        public PocketController(ILogger<PocketController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _consumerKey = _configuration.GetValue<string>("PocketConsumerKey");
            _client.AddDefaultHeaders(DefaultApiHeaders());
        }

        private Dictionary<string, string> DefaultApiHeaders()
        {
            return new Dictionary<string, string>
            {
                {"X-Accept", "application/json"}
            };
        }

        [HttpPost]
        [Route("{*page}", Name = "Proxy")]
        public async Task<ProxyResponse> Proxy([FromBody] ExpandoObject content, string page)
        {
            content.TryAdd("consumer_key", _consumerKey);
            var x = JsonSerializer.Serialize(content);

            var request = new RestRequest(page, DataFormat.Json)
            {
                Method = Method.POST
            };
            request.AddHeader("Accept", "*/*");
            request.AddHeader("Content-Type", "application/json");
            request.AddParameter(
                "application/json; charset=utf-8",
                x,
                ParameterType.RequestBody);

            var response = await _client.ExecutePostAsync<object>(request);

            if (!response.IsSuccessful)
                _logger.LogError($"Pocket API Response ({response.StatusCode}): {response.Content}");

            return new ProxyResponse
            {
                Data = response.Data,
                HttpCode = (int) response.StatusCode,
                Success = response.IsSuccessful
            };
        }
    }

    public class ProxyResponse
    {
        public object Data { get; set; }
        public int HttpCode { get; set; }
        public bool Success { get; set; }
    }
}