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

test("Gets the RTV EURO AGD product conrrectly", async () => {
  let info = await productInfo(
    "https://www.euro.com.pl/kontrolery-do-gier/sony-dualshock-4-ps4-v2.bhtml"
  );

  expect(info.shop).toBe("RTV EURO AGD");
  expect(info.originalName).toBe("Sony DualShock 4 v2 (czarny)");
  expect(info.price).not.toBeNaN();
  expect(parseFloat(info.price)).toEqual(info.price);
});

test("Gets the Morele product conrrectly", async () => {
  let info = await productInfo(
    "https://www.morele.net/gamepad-sony-ps4-dualshock-4-v2-9870050-1053659/"
  );

  expect(info.shop).toBe("Morele.net");
  expect(info.originalName).toBe("Gamepad Sony PS4 Dualshock 4 V2 (9870050)");
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
