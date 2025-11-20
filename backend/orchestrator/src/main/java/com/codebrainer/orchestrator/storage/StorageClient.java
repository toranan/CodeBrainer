package com.codebrainer.orchestrator.storage;

import java.io.IOException;

public interface StorageClient {

    void save(String path, byte[] bytes) throws IOException;

    byte[] read(String path) throws IOException;

    void delete(String path) throws IOException;

    void deleteDirectory(String path) throws IOException;

    default void saveString(String path, String content) throws IOException {
        save(path, content.getBytes());
    }

    default String readString(String path) throws IOException {
        return new String(read(path));
    }
}

