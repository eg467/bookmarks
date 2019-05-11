# /Api Proxy
A .NET Web API passthrough for the Pocket API, which doesn't enable CORS requests.

# /Web
A font-end interface for Pocket bookmarks.


# Instructions

1) Create `<root application directory>/AppSettings.config` with the following:
```xml
<?xml version="1.0" encoding="utf-8" ?>
<appSettings>
  <add key="PocketConsumerKey" value="<YOUR CONSUMER KEY FROM GETPOCKET.COM>" />
</appSettings>
```

2) Build the solution using VS.