using Algorithmia;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace ApiProxy.Controllers
{

#if DEBUG
    [EnableCors(origins: "*", headers: "*", methods: "*")]
#endif
    [RoutePrefix("api/default")]
    public class DefaultController : ApiController
    {
        private string AlgorithmiaKey => ConfigurationManager.AppSettings["AlgorithmiaKey"];

        private dynamic CallAlgorithm(string tag, object input)
        {
            var client = new Client(AlgorithmiaKey);
            var algorithm = client.algo(tag);
            algorithm.setOptions(timeout: 300); // optional
            return algorithm.pipe<object>(input);
        }

        [HttpGet]
        [Route("SuggestedTags", Name = "SuggestedTags")]
        public IEnumerable<string> SuggestedTags(string url)
        {
            var response = CallAlgorithm("tags/AutoTagURL/0.1.9", url);

            if (response.error != null || response.result == null)
            {
                return new string[0];
            }

            var tags = ((JObject)response.result).ToObject<Dictionary<string, int>>();
            return tags
                .OrderByDescending(kv => kv.Value)
                .Select(kv => kv.Key)
                .ToArray();
        }

    }
}
