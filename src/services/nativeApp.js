export async function initializeNativeApp({ onBack } = {}) {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return () => {};

    const [{ App }, { SplashScreen }, { StatusBar, Style }] = await Promise.all([
      import("@capacitor/app"),
      import("@capacitor/splash-screen"),
      import("@capacitor/status-bar"),
    ]);

    await Promise.allSettled([
      StatusBar.setStyle({ style:Style.Dark }),
      StatusBar.setBackgroundColor({ color:"#f5ecd8" }),
      StatusBar.setOverlaysWebView({ overlay:false }),
      SplashScreen.hide({ fadeOutDuration:250 }),
    ]);

    const listener = await App.addListener("backButton", () => {
      const handled = onBack?.();
      if (handled === false) App.exitApp();
    });
    return () => listener.remove();
  } catch (error) {
    console.warn("Native app services are unavailable; continuing as a web app.", error);
    return () => {};
  }
}
