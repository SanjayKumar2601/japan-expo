package com.expo.sales.entity;
import jakarta.persistence.*;
@Entity @Table(name="app_settings")
public class AppSettingsEntity {
 @Id private Long id=1L;
 @Column(nullable=false) private String theme="light";
 @Column(nullable=false) private String language="en";
 @Column(nullable=false) private boolean soundEnabled=true;
 private String lastSyncedAt;
 @Column(nullable=false) private boolean sheetsConnected=true;
 @Column(nullable=false) private String version="1.0.0";
 public AppSettingsEntity(){}
 public Long getId(){return id;} public String getTheme(){return theme;} public String getLanguage(){return language;} public boolean isSoundEnabled(){return soundEnabled;} public String getLastSyncedAt(){return lastSyncedAt;} public boolean isSheetsConnected(){return sheetsConnected;} public String getVersion(){return version;}
 public void setTheme(String v){theme=v;} public void setLanguage(String v){language=v;} public void setSoundEnabled(boolean v){soundEnabled=v;} public void setLastSyncedAt(String v){lastSyncedAt=v;}
}
