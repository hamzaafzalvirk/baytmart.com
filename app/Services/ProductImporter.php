<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class ProductImporter
{
    public function fetch(string $url): array
    {
        $response = Http::timeout(12)->withUserAgent('BaytMart Product Importer/1.0')->get($url);
        if ($response->failed()) {
            throw new RuntimeException('The product page could not be fetched.');
        }

        $document = new \DOMDocument();
        @$document->loadHTML($response->body());
        $xpath = new \DOMXPath($document);
        $meta = [];
        foreach ($xpath->query('//meta[@property or @name]') as $node) {
            $key = $node->getAttribute('property') ?: $node->getAttribute('name');
            $meta[Str::lower($key)] = trim($node->getAttribute('content'));
        }

        $structured = $this->structuredProduct($xpath);
        $title = $structured['name'] ?? $meta['og:title'] ?? $xpath->evaluate('string(//title)') ?: 'Imported product';
        $description = $structured['description'] ?? $meta['og:description'] ?? $meta['description'] ?? null;
        $image = $structured['image'] ?? $meta['og:image'] ?? null;
        $sourcePrice = $this->money($structured['price'] ?? $meta['product:price:amount'] ?? null);
        if ($sourcePrice === null || $sourcePrice <= 0) {
            throw new RuntimeException('No valid product price was found on that page.');
        }

        return [
            'title' => Str::limit(trim(strip_tags($title)), 180, ''),
            'description' => $description ? Str::limit(trim(strip_tags($description)), 5000, '') : null,
            'image_url' => $image,
            'source_price' => $sourcePrice,
            'price' => round($sourcePrice * 1.4, 2),
            'source_url' => $url,
        ];
    }

    private function structuredProduct(\DOMXPath $xpath): array
    {
        foreach ($xpath->query('//script[@type="application/ld+json"]') as $script) {
            $data = json_decode($script->textContent, true);
            $items = isset($data['@graph']) ? $data['@graph'] : [$data];
            foreach ($items as $item) {
                if (!is_array($item) || ($item['@type'] ?? null) !== 'Product') {
                    continue;
                }
                $offer = $item['offers'] ?? [];
                $offer = $offer[0] ?? $offer;
                $image = $item['image'] ?? null;
                return [
                    'name' => $item['name'] ?? null,
                    'description' => $item['description'] ?? null,
                    'image' => is_array($image) ? ($image[0] ?? null) : $image,
                    'price' => $offer['price'] ?? null,
                ];
            }
        }

        return [];
    }

    private function money(mixed $value): ?float
    {
        if (!is_scalar($value)) {
            return null;
        }
        $value = preg_replace('/[^0-9.]/', '', (string) $value);

        return is_numeric($value) ? (float) $value : null;
    }
}
