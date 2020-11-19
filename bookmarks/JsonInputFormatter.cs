using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Net.Http.Headers;

namespace Bookmarks
{
    // https://stackoverflow.com/questions/63571300/using-system-text-json-as-default-serializer-in-asp-net-core-2-1
    public class JsonInputFormatter : TextInputFormatter, IInputFormatterExceptionPolicy
    {
        public JsonInputFormatter()
        {
            var mediatype = MediaTypeHeaderValue.Parse("application/json");
            SupportedMediaTypes.Add(mediatype);

            SupportedEncodings.Add(Encoding.UTF8);
            SupportedEncodings.Add(Encoding.Unicode);
        }

        public InputFormatterExceptionPolicy ExceptionPolicy { get; }

        public override async Task<InputFormatterResult> ReadRequestBodyAsync(InputFormatterContext context,
            Encoding encoding)
        {
            using var sr = new StreamReader(context.HttpContext.Request.Body);
            var request = await sr.ReadToEndAsync();
            var result = JsonSerializer.Deserialize(request, context.ModelType);
            return await InputFormatterResult.SuccessAsync(result);
        }
    }
}