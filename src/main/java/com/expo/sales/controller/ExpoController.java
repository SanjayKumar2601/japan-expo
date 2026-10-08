package com.expo.sales.controller;

import com.expo.sales.dto.ApiDtos;
import com.expo.sales.service.ExpoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ExpoController {
    private final ExpoService service;
    public ExpoController(ExpoService service){this.service=service;}

    @GetMapping("/health") public Map<String,Object> health(){return Map.of("status","UP","service","expo-sales-backend");}
    @GetMapping("/categories") public List<ApiDtos.CategoryResponse> categories(){return service.getCategories();}
    @PostMapping("/categories") public ApiDtos.CategoryResponse createCategory(@Valid @RequestBody ApiDtos.CategoryInput input){return service.createCategory(input);}
    @PostMapping("/products") public ApiDtos.ProductResponse createProduct(@RequestHeader(value="X-Admin-Password", required=false) String password, @Valid @RequestBody ApiDtos.ProductInput input){return service.createProduct(password, input);}
    @PutMapping("/products/{id}") public ApiDtos.ProductResponse updateProduct(@PathVariable String id,@RequestHeader(value="X-Admin-Password", required=false) String password,@Valid @RequestBody ApiDtos.ProductInput input){return service.updateProduct(password,id,input);}
    @GetMapping("/products") public List<ApiDtos.ProductResponse> products(){return service.getProducts();}
    @GetMapping("/products/{id}") public ApiDtos.ProductResponse product(@PathVariable String id){return service.getProduct(id);}
    @DeleteMapping("/products/{id}") public ResponseEntity<Void> deleteProduct(@PathVariable String id,@RequestHeader(value="X-Admin-Password", required=false) String password){service.deleteProduct(password,id); return ResponseEntity.noContent().build();}
    @GetMapping("/orders") public List<ApiDtos.OrderResponse> orders(){return service.getOrders();}
    @PostMapping("/orders") public ResponseEntity<ApiDtos.OrderResponse> create(@Valid @RequestBody ApiDtos.CreateOrderRequest request){return ResponseEntity.ok(service.createOrder(request));}
    @GetMapping("/dashboard") public ApiDtos.DashboardResponse dashboard(){return service.dashboard();}
    @GetMapping("/analytics") public ApiDtos.AnalyticsResponse analytics(){return service.analytics();}
    @GetMapping("/settings") public ApiDtos.SettingsResponse settings(){return service.getSettings();}
    @PatchMapping("/settings") public ApiDtos.SettingsResponse settings(@RequestBody ApiDtos.SettingsPatch patch){return service.updateSettings(patch);}
}
