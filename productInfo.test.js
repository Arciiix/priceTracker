const server = require("./server");
const productInfo = server.productInfo;

test("Gets the MediaExpert product correctly", async () => {
  let info = await productInfo(
    "https://www.mediaexpert.pl/gaming/kontrolery-pady/kontroler-sony-dualshock-4-v2-czarny"
  );

  expect(info.shop).toBe("MediaExpert");
  expect(info.originalName).toBe("Kontroler SONY DualShock 4 V2 Czarny");
  expect(info.price).not.toBeNaN();
  expect(parseFloat(info.price)).toEqual(info.price);
});

test("Gets the RTV EURO AGD product correctly", async () => {
  let info = await productInfo(
    "https://www.euro.com.pl/kontrolery-do-gier/sony-dualshock-4-ps4-v2.bhtml"
  );

  expect(info.shop).toBe("RTV EURO AGD");
  expect(info.originalName).toBe("Sony DualShock 4 v2 (czarny)");
  expect(info.price).not.toBeNaN();
  expect(parseFloat(info.price)).toEqual(info.price);
});

test("Gets the Morele product correctly", async () => {
  let info = await productInfo(
    "https://www.morele.net/smartfon-apple-iphone-11-64-gb-dual-sim-czarny-mwlt2pm-a-5939894/"
  );

  expect(info.shop).toBe("Morele.net");
  expect(info.originalName).toBe(
    "Smartfon Apple iPhone 11 64 GB Dual SIM Czarny (MWLT2PM/A)"
  );
  expect(info.price).not.toBeNaN();
  expect(parseFloat(info.price)).toEqual(info.price);
});

test("Gets the Botland product correctly", async () => {
  let info = await productInfo(
    "https://botland.com.pl/pl/moduly-i-zestawy-raspberry-pi-4b/14646-raspberry-pi-4-model-b-wifi-dualband-bluetooth-2gb-ram-15ghz-765756931175.html?search_query=raspberry+pi+4&results=1232"
  );

  expect(info.shop).toBe("Botland");
  expect(info.originalName).toBe(
    "Raspberry Pi 4 model B WiFi DualBand Bluetooth 2GB RAM 1,5GHz"
  );
  expect(info.price).not.toBeNaN();
  expect(parseFloat(info.price)).toEqual(info.price);
});

test("Handles missing url", async () => {
  let info = await productInfo();
  expect(info.error).toBe(true);
});
test("Handles wrong url", async () => {
  let info = await productInfo("https://www.youtube.com/");
  expect(info.error).toBe(true);
});
