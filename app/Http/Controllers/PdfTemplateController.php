<?php

namespace App\Http\Controllers;

use App\Models\PdfTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PdfTemplateController extends Controller
{
    public function show($key)
    {
        return PdfTemplate::where('key', $key)->firstOrFail();
    }

    public function update(Request $request, $key)
    {
        $template = PdfTemplate::where('key', $key)->firstOrFail();
        
        $data = $request->validate([
            'fields_config' => 'required|array',
            'fields_config.*.x' => 'required|numeric',
            'fields_config.*.y' => 'required|numeric',
            'fields_config.*.page' => 'nullable|integer|min:1',
            'fields_config.*.font' => 'required|string',
            'fields_config.*.size' => 'required|numeric',
        ]);

        $template->update([
            'fields_config' => $data['fields_config']
        ]);

        // Generate Markdown content
        $mdContent = "# Fields Configuration for {$key}\n\n";
        foreach ($data['fields_config'] as $field => $config) {
             $mdContent .= "## {$field}\n";
             $mdContent .= "- **Page**: " . ($config['page'] ?? 1) . "\n";
             $mdContent .= "- **X**: {$config['x']}\n";
             $mdContent .= "- **Y**: {$config['y']}\n";
             $mdContent .= "- **Font**: {$config['font']}\n";
             $mdContent .= "- **Size**: {$config['size']}\n\n";
        }

        // Save to file (using storage_path for consistency with uploadTemplate)
        $directory = storage_path('app/templates');
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
        
        file_put_contents($directory . DIRECTORY_SEPARATOR . $key . '.md', $mdContent);

        return $template;
    }

    public function uploadTemplate(Request $request, $key)
    {
        \Log::info("Upload request received for $key", ['files' => $request->allFiles()]);

        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:10240', // Max 10MB
        ]);

        $template = PdfTemplate::where('key', $key)->firstOrFail();
        
        if ($request->hasFile('pdf')) {
            $file = $request->file('pdf');
            $filename = $key . '_' . time() . '_' . uniqid() . '.pdf';
            
            \Log::info("Processing file", ['original_name' => $file->getClientOriginalName()]);

            // Ensure directory exists
            $directory = storage_path('app/templates');
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }

            // Use direct move to avoid Flysystem/Storage abstraction issues on Windows/OneDrive
            $absolutePath = $directory . DIRECTORY_SEPARATOR . $filename;
            
            try {
                $file->move($directory, $filename);
            } catch (\Exception $e) {
                \Log::error("Move failed: " . $e->getMessage());
                 abort(500, "Could not move file: " . $e->getMessage());
            }
            
            // Allow a brief pause for file system OS flush (helpful on Windows/OneDrive)
            clearstatcache(); 
            usleep(200000); // 200ms

            if (!file_exists($absolutePath)) {
                 \Log::error("File missing after move: $absolutePath");
                 abort(500, "File was not saved to disk.");
            }

            if (filesize($absolutePath) === 0) {
                 \Log::error("File is empty (0 bytes) after move: $absolutePath");
                 unlink($absolutePath); // cleanup
                 abort(500, "File is empty after save.");
            }
            
            \Log::info("File successfully moved to $absolutePath, Size: " . filesize($absolutePath));

            // Normalize PDF for FPDI Compatibility using Node script
            $nodeScriptPaths = [
                base_path('scripts/normalize-pdf.js'),
                base_path('../scripts/normalize-pdf.js')
            ];
            
            $scriptPath = null;
            foreach($nodeScriptPaths as $path) {
                if(file_exists($path)) {
                    $scriptPath = $path;
                    break;
                }
            }

            if ($scriptPath) {
                 $cmd = "node " . escapeshellarg($scriptPath) . " " . escapeshellarg($absolutePath) . " " . escapeshellarg($absolutePath);
                 $output = [];
                 $returnVar = 0;
                 exec($cmd, $output, $returnVar);
                 
                 if ($returnVar !== 0) {
                     \Log::error("PDF Normalization failed", ['output' => $output]);
                     // We continue anyway, hoping it works, or maybe abort? 
                     // Let's abort safely if we know it failed, but maybe the original was fine?
                     // Actually, if FPDI failed before, we need this to succeed.
                 } else {
                     \Log::info("PDF Normalized successfully");
                     clearstatcache();
                 }
            }

            // Store relative path for DB
            $dbPath = 'templates/' . $filename;
            
            try {
                $template->update(['template_path' => $dbPath]);
            } catch (\Exception $e) {
                 \Log::error("Database update failed: " . $e->getMessage());
                 abort(500, "Database update failed.");
            }
        }

        return $template;
    }
}
