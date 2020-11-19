using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;

namespace Bookmarks.Controllers
{
    [Route("api/virustotal")]
    [ApiController]
    public class VirusTotalController : ControllerBase
    {
        [HttpGet]
        [Route("url", Name = "VtUrl")]
        public string VtUrl(string url)
        {
            // https://support.virustotal.com/hc/en-us/articles/115002094669-How-can-I-link-to-the-most-recent-report-on-a-given-file-or-URL-
            var sha = Sha256(url);
            return $"https://www.virustotal.com/gui/url/{sha}/detection";
        }

        private static string Sha256(string input)
        {
            var crypt = new SHA256Managed();
            var hash = string.Empty;
            var crypto = crypt.ComputeHash(Encoding.ASCII.GetBytes(input));
            foreach (var theByte in crypto)
                hash += theByte.ToString("x2");
            return hash;
        }
    }
}