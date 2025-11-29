package com.codebrainer.orchestrator.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Comparator;

public class LocalStorageClient implements StorageClient {

    private final Path basePath;

    public LocalStorageClient(String basePath) {
        this.basePath = Path.of(basePath).toAbsolutePath().normalize();
    }

    @Override
    public void save(String path, byte[] bytes) throws IOException {
        Path target = resolve(path);
        Files.createDirectories(target.getParent());
        Files.write(target, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    @Override
    public byte[] read(String path) throws IOException {
        Path target = resolve(path);
        return Files.readAllBytes(target);
    }

    @Override
    public void delete(String path) throws IOException {
        Path target = resolve(path);
        Files.deleteIfExists(target);
    }

    @Override
    public void deleteDirectory(String path) throws IOException {
        Path target = resolve(path);
        if (Files.exists(target)) {
            Files.walk(target)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            Files.deleteIfExists(p);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    });
        }
    }
    
    @Override
    public boolean exists(String path) {
        try {
            Path target = resolve(path);
            return Files.exists(target);
        } catch (Exception e) {
            return false;
        }
    }

    private Path resolve(String path) {
        Path resolved = basePath.resolve(path).normalize();
        if (!resolved.startsWith(basePath)) {
            throw new IllegalArgumentException("Invalid storage path");
        }
        return resolved;
    }
}

