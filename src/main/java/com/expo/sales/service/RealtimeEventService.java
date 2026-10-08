package com.expo.sales.service;

import com.expo.sales.dto.ApiDtos;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class RealtimeEventService {
    private final CopyOnWriteArrayList<SseEmitter> clients = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);
        clients.add(emitter);
        Runnable remove = () -> clients.remove(emitter);
        emitter.onCompletion(remove);
        emitter.onTimeout(remove);
        emitter.onError(error -> remove.run());
        try {
            emitter.send(SseEmitter.event()
                    .id(UUID.randomUUID().toString())
                    .name("CONNECTED")
                    .data(Map.of("type", "CONNECTED", "message", "Connected to expo POS", "createdAt", Instant.now().toString())));
        } catch (IOException e) {
            remove.run();
        }
        return emitter;
    }

    public void publish(ApiDtos.PosEvent event) {
        for (SseEmitter emitter : clients) {
            try {
                emitter.send(SseEmitter.event()
                        .id(event.id())
                        .name(event.type())
                        .data(event));
            } catch (IOException | IllegalStateException ex) {
                clients.remove(emitter);
            }
        }
    }
}
