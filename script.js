// Задайте настройки RTB блоков из Яндекс Рекламной Сети.
const adDict = {
  mobile: [
    {
      renderTo: "yandex_rtb_R-A-123456-1",
      blockId: "R-A-123456-1",
    },
    {
      renderTo: "yandex_rtb_R-A-123456-2",
      blockId: "R-A-123456-2",
    },
    {
      renderTo: "yandex_rtb_R-A-123456-3",
      blockId: "R-A-123456-3",
    },
  ],
  desktop: [
    {
      renderTo: "yandex_rtb_R-A-123456-4",
      blockId: "R-A-123456-4",
    },
    {
      renderTo: "yandex_rtb_R-A-123456-5",
      blockId: "R-A-123456-5",
    },
    {
      renderTo: "yandex_rtb_R-A-123456-6",
      blockId: "R-A-123456-6",
    },
  ],
};

function detectAdblock() {
  const adblockTests = {
    // https://github.com/uBlockOrigin/uAssets/blob/master/filters/filters-2022.txt
    uBlockOrigin: {
      url: "https://incolumitas.com/data/pp34.js?sv=",
      id: "837jlaBksSjd9jh",
    },
    // https://github.com/easylist/easylist/blob/master/easylist/easylist_general_block.txt
    adblockPlus: {
      url: "https://incolumitas.com/data/neutral.js?&ad_height=",
      id: "hfuBadsf3hFAk",
    },
  };

  function canLoadRemoteScript(obj) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");

      script.onload = function () {
        if (document.getElementById(obj.id)) {
          resolve(false);
        } else {
          resolve(true);
        }
      };

      script.onerror = function () {
        resolve(true);
      };

      script.src = obj.url;
      document.body.appendChild(script);
    });
  }

  return new Promise(function (resolve, reject) {
    let promises = [
      canLoadRemoteScript(adblockTests.uBlockOrigin),
      canLoadRemoteScript(adblockTests.adblockPlus),
    ];

    Promise.all(promises)
      .then((results) => {
        resolve({
          uBlockOrigin: results[0],
          adblockPlus: results[1],
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// Проверка на наличие блокировщика рекламы.
const detect = () => {
  detectAdblock().then((res) => {
    if (res.adblockPlus || res.uBlockOrigin) {
      console.log("Пожалуйста отключи блокировщик рекламы 😢");
    } else {
      console.log("Спасибо за то, что не используешь блокировщик рекламы 💕");
      let article = document.getElementsByTagName("article")[0];
      let paragraphs = article.getElementsByTagName("p");
      let paragraphsNumber = paragraphs.length;
      let device = deviceType();
      let firstAd = false;
      let secondAd = false;
      let thirdAd = false;
      // Размещение первого баннера после 1 (отстчет идет с нуля) параграфа, если их не больше двух, либо же после второго параграфа.
      if (paragraphsNumber === 1 || paragraphsNumber === 2) {
        firstAd = paragraphs[0];
        adRender(device, 0, firstAd);
      } else if (paragraphsNumber > 2) {
        firstAd = paragraphs[1];
        adRender(device, 0, firstAd);
      }
      // Размещение второго баннера после 5 параграфа.
      if (paragraphsNumber > 5) {
        secondAd = paragraphs[4];
        adRender(device, 1, secondAd);
      }
      // Размещение третьего баннера за 2 параграфа до конца статьи.
      if (paragraphsNumber > 11) {
        thirdAd = paragraphs[paragraphsNumber - 3];
        adRender(device, 2, thirdAd);
      }
    }
  });
};

// Яндекс требует использовать различные блоки для десктопов и мобильных устройст, поэтому осуществляем простую проверку.
const deviceType = () => {
  if (
    window.matchMedia("(min-width: 1200px) and (orientation: landscape)")
      .matches
  ) {
    return "desktop";
  } else {
    return "mobile";
  }
};

// Функция рендеринга рекламы
const adRender = (device, advertID, paragraph) => {
  let adContainer = document.createElement("div");
  adContainer.className = "advert";
  let thisBlockId;
  let thisRenderTo;
  if (device == "mobile") {
    thisBlockId = adDict.mobile[advertID].blockId;
    thisRenderTo = adDict.mobile[advertID].renderTo;
  } else {
    thisBlockId = adDict.desktop[advertID].blockId;
    thisRenderTo = adDict.desktop[advertID].renderTo;
  }
  adContainer.id = thisRenderTo;
  paragraph.after(adContainer);
  window.yaContextCb.push(() => {
    Ya.Context.AdvManager.render({
      renderTo: thisRenderTo,
      blockId: thisBlockId,
    });
  });
};

// Исполнять скрипт после отрисовки DOM
document.addEventListener("DOMContentLoaded", detect);
