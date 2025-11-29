package com.codebrainer.orchestrator.storage;

import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;
import java.util.Base64;

public class SupabaseStorageClient implements StorageClient {

    private final String supabaseUrl;
    private final String supabaseKey;
    private final String bucketName;
    private final RestTemplate restTemplate;

    public SupabaseStorageClient(String supabaseUrl, String supabaseKey, String bucketName) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.bucketName = bucketName;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public void save(String path, byte[] bytes) throws IOException {
        try {
            String url = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, path);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            HttpEntity<byte[]> request = new HttpEntity<>(bytes, headers);

            // Try to update first (file might already exist)
            try {
                restTemplate.exchange(url, HttpMethod.PUT, request, String.class);
            } catch (HttpClientErrorException.NotFound e) {
                // File doesn't exist, create it with POST
                restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            }
        } catch (Exception e) {
            throw new IOException("Failed to save file to Supabase Storage: " + path, e);
        }
    }

    @Override
    public byte[] read(String path) throws IOException {
        try {
            // Use public URL for reading (bucket is public)
            String url = String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, path);

            ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);

            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            throw new IOException("File not found in Supabase Storage: " + path);
        } catch (Exception e) {
            throw new IOException("Failed to read file from Supabase Storage: " + path, e);
        }
    }

    @Override
    public void delete(String path) throws IOException {
        try {
            String url = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, path);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);

            HttpEntity<Void> request = new HttpEntity<>(headers);

            restTemplate.exchange(url, HttpMethod.DELETE, request, String.class);
        } catch (HttpClientErrorException.NotFound e) {
            // File doesn't exist, which is fine for delete operation
        } catch (Exception e) {
            throw new IOException("Failed to delete file from Supabase Storage: " + path, e);
        }
    }

    @Override
    public void deleteDirectory(String path) throws IOException {
        // Supabase Storage doesn't have a direct "delete directory" API
        // This would need to list all files in the path and delete them one by one
        // For now, we'll throw an UnsupportedOperationException
        // TODO: Implement by listing files with prefix and deleting them
        throw new UnsupportedOperationException("Delete directory not yet implemented for Supabase Storage");
    }
    
    @Override
    public boolean exists(String path) {
        try {
            String url = String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, path);
            
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            // Use HEAD request to check existence without downloading content
            ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.HEAD, request, Void.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (HttpClientErrorException e) {
            // 4xx errors mean file doesn't exist or access denied
            return false;
        } catch (Exception e) {
            // Other errors (network, etc)
            return false;
        }
    }
}
