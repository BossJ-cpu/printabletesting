<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Laravel + React Status</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
            color: #e2e8f0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: "Inter", system-ui, -apple-system, sans-serif;
        }
        #react-root {
            width: min(900px, 92vw);
        }
    </style>
</head>
<body>
    <div id="react-root"></div>
</body>
</html>
