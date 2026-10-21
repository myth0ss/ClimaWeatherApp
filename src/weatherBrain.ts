export interface WeatherData {
  cityName: string;
  temp: number;
  description: string;
  icon: string;
  message: string;
}

export class WeatherBrain {
  public async getLocationWeather(
    lat: number,
    lon: number,
    customName?: string,
  ): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Không thể tải dữ liệu thời tiết");
    const data = await res.json();

    let resolvedCityName: string = customName || "";
    if (!resolvedCityName) {
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        const geoRes = await fetch(geoUrl, {
          headers: { "User-Agent": "ClimaApp/1.0" },
        });
        const geoData = await geoRes.json();
        resolvedCityName =
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.county ||
          geoData.address?.state ||
          "Vị trí của bạn";
      } catch {
        resolvedCityName = "Vị trí hiện tại";
      }
    }

    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;

    return {
      cityName: resolvedCityName,
      temp,
      description: this.getWeatherDescription(code),
      icon: this.getWeatherIcon(code),
      message: this.getMessage(temp),
    };
  }

  public async getCityWeather(cityName: string): Promise<WeatherData> {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName,
    )}&count=1&language=vi&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("Không tìm thấy thành phố");
    }

    const location = geoData.results[0];
    return await this.getLocationWeather(
      location.latitude,
      location.longitude,
      location.name,
    );
  }

  private getWeatherDescription(code: number): string {
    if (code === 0) return "Trời quang đãng";
    if (code === 1 || code === 2) return "Trời có mây nhẹ";
    if (code === 3) return "Nhiều mây u ám";
    if (code >= 45 && code <= 48) return "Có sương mù";
    if (code >= 51 && code <= 55) return "Mưa phùn nhẹ";
    if (code >= 61 && code <= 65) return "Có mưa rào";
    if (code >= 71 && code <= 77) return "Tuyết rơi";
    if (code >= 80 && code <= 82) return "Mưa rào nặng hạt";
    if (code >= 95) return "Dông bão sấm sét";
    return "Thời tiết ổn định";
  }

  public getWeatherIcon(code: number): string {
    if (code === 0) return "sunny-outline";
    if (code === 1 || code === 2) return "partly-sunny-outline";
    if (code === 3) return "cloudy-outline";
    if (code >= 45 && code <= 48) return "cloud-outline";
    if (code >= 51 && code <= 65) return "rainy-outline";
    if (code >= 71 && code <= 77) return "snow-outline";
    if (code >= 80 && code <= 82) return "rainy";
    if (code >= 95) return "thunderstorm-outline";
    return "sunny-outline";
  }

  public getMessage(temp: number): string {
    if (temp > 32)
      return "Thời tiết khá nóng, hãy mang theo nước và kem chống nắng!";
    if (temp > 24) return "Thời tiết rất lý tưởng để đi dạo ngoài trời!";
    if (temp > 18) return "Trời se lạnh, nhớ khoác thêm một chiếc áo mỏng nhé.";
    return "Trời khá rét! Hãy mặc áo ấm cẩn thận.";
  }
}

export const weatherBrain = new WeatherBrain();
