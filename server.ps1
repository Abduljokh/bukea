param(
    [int]$Port = 5500
)

$root = $PSScriptRoot
if (-not $root) {
    $root = (Get-Location).Path
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

function Get-MimeType($ext) {
    switch ($ext) {
        ".html"  { return "text/html; charset=utf-8" }
        ".htm"   { return "text/html; charset=utf-8" }
        ".css"   { return "text/css; charset=utf-8" }
        ".js"    { return "application/javascript; charset=utf-8" }
        ".json"  { return "application/json; charset=utf-8" }
        ".png"   { return "image/png" }
        ".jpg"   { return "image/jpeg" }
        ".jpeg"  { return "image/jpeg" }
        ".svg"   { return "image/svg+xml" }
        ".ico"   { return "image/x-icon" }
        default  { return "application/octet-stream" }
    }
}

try {
    $listener.Start()
    Write-Output "Servidor HTTP local de Bookealo escuchando en $prefix"

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $urlPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($urlPath)) {
                $urlPath = "index.html"
            }
            $urlPath = [System.Uri]::UnescapeDataString($urlPath)
            $filePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $urlPath))

            if (-not $filePath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
                $response.StatusCode = 403
                $response.Close()
                continue
            }

            if (Test-Path $filePath -PathType Container) {
                $filePath = [System.IO.Path]::Combine($filePath, "index.html")
            }

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = Get-MimeType $ext
                $response.ContentLength64 = $bytes.Length
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $err = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1><p>$urlPath</p>")
                $response.ContentType = "text/html; charset=utf-8"
                $response.ContentLength64 = $err.Length
                $response.OutputStream.Write($err, 0, $err.Length)
            }
        } catch {
            # Ignorar errores de conexión
        } finally {
            $response.Close()
        }
    }
} finally {
    $listener.Stop()
}
