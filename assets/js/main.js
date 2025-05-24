// モーダル表示で自己紹介動画が見れる
document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openVideoBtn");
  const modal = document.getElementById("videoModal");
  const closeBtn = document.getElementById("closeModal");
  const iframe = document.getElementById("youtubeVideo");

  const videoURL = "https://www.youtube.com/embed/MLe4HbPqWtg?autoplay=1";

  openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    setTimeout(() => {
      iframe.src = videoURL;
    }, 100);
  });

  function closeModal() {
    modal.style.display = "none";
    iframe.src = "";
  }

  closeBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    closeModal();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      closeModal();
    }
  });
});


// アコーディオンでFAQで見れる
document.addEventListener("DOMContentLoaded", () => {
  const accordionHeaders = document.querySelectorAll(".accordion-header");

  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;

      // 他のを閉じる（任意）
      document.querySelectorAll(".accordion-content").forEach((el) => {
        if (el !== content) {
          el.style.maxHeight = null;
        }
      });

      // トグル動作
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
});

// Xにポストする
 function postToX() {
      const text = encodeURIComponent("「ITスキル×自身の障害経験で、誰かの“はじめの一歩”を支えたい」\n動画で自己紹介しています。ぜひご覧ください！\n");
      const url = encodeURIComponent("https://ryota-yamamoto-03.github.io/about-me/");
      const hashtags = "就労移行支援,IT支援,自己紹介";

      const postUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`;
      window.open(postUrl, "_blank");
  }

// モーダル＋縦スクロール可能
// カードをクリックしたら対応するモーダルを表示
  document.querySelectorAll('.work-card-1').forEach(card => {
    card.addEventListener('click', () => {
      const modalId = card.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'flex';
      }
    });
  });

  document.querySelectorAll('.work-card-2').forEach(card => {
    card.addEventListener('click', () => {
      const modalId = card.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'flex';
      }
    });
  });

  // モーダルを閉じる（×ボタン）
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.work-modal').style.display = 'none';
    });
  });

  // モーダル外クリックでも閉じる
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('work-modal')) {
      e.target.style.display = 'none';
    }
  });

  // Escキーでも閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll('.work-modal').forEach(modal => {
        modal.style.display = 'none';
      });
    }
  });

// ハッシュタグをXでポストする
const siteURL = "https://ryota-yamamoto-03.github.io/about-me/"; // 現在のサイトURL

  document.querySelectorAll('.hashtag').forEach(tag => {
    tag.addEventListener('click', () => {
      const hashtag = tag.getAttribute('data-tag');
      const text = `私の特徴は #${hashtag} です。\n詳しくはこちらのサイトから！\n${siteURL}`;
      const tweetURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(tweetURL, '_blank');
    });
  });

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// スマホアラート機能
window.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 768) {
      const alertBox = document.getElementById('mobile-alert');
      alertBox.classList.add('show');
      setTimeout(() => {
        alertBox.classList.remove('show');
      }, 5000); // 5秒後に消える
    }
  });