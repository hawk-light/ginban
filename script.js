import {
    db,
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    deleteDoc,
    doc
} from "./firebase.js";

let unsubscribeCurrent = null;
//======================================
// メニュー一覧
//======================================
//炊き立て特製天丼1400円
const menus = [

    {
        id: 1,
        name: "①お薦め揚げ立て 炊き立て特製天丼",
        price: 1400
    },

    {
        id: 2,
        name: "②日替わり 上刺身 焼魚 定食",
        price: 1900
    },

    {
        id: 3,
        name: "③日替わり 刺身 焼魚 定食",
        price: 1500
    },

    {
        id: 4,
        name: "④日替わり 焼魚 定食",
        price: 1300
    },

    {
        id: 5,
        name: "⑤日替わり 煮物 定食",
        price: 1500
    },

    {
        id: 6,
        name: "磯の香りたっぷり あおさの味噌汁",
        price: 300
    },

    {
        id: 7,
        name: "千疋屋ストレートジュース",
        price: 1500
    },

    {
        id: 8,
        name: "★吟ばん 定食 上刺身 焼魚 煮物など 特製汁",
        price: 2500
    },

    {
        id: 9,
        name: "①おまかせ海鮮 丼",
        price: 1200
    },

    {
        id: 10,
        name: "②おまかせ煮物 定食",
        price: 1300
    },

    {
        id: 11,
        name: "③焼魚 定食 茨城越田サバ文化干し",
        price: 1200
    },

    {
        id: 12,
        name: "★★季節のアイス",
        price: 200
    },
    {
        id: 13,
        name: "★★ホットコーヒー",
        price: 300
    },
    {
        id: 14,
        name: "★ビジネスランチ 料理長おまかせコース ミニ海鮮丼付",
        price: 9900
    },
    {
        id: 15,
        name: "ビジネスランチ 料理長おまかせミニコース",
        price: 5500
    },
    {
        id: 16,
        name: "ビジネスランチ 特上刺身合せと天婦羅 セット",
        price: 4400
    },
    {
        id: 17,
        name: "ビジネスランチ 松花堂 小皿料理 セット",
        price: 3300
    }
];


//======================================
// 初期処理
//======================================
const elements = {};

window.onload = function () {
    initElements();

    loadNickname();

    createMenuCards();

    listenCurrentOrders();

    setupEvents();

};

function initElements() {

    elements.nicknameInput =
        document.getElementById("nickname");

    elements.menuList =
        document.getElementById("menu-list");

    elements.orderList =
        document.getElementById("order-list");

    elements.allOrderList =
        document.getElementById("all-order-list");

}
//======================================
// イベント設定
//======================================

function setupEvents() {
    //--------------------------------------------------
    // Enterキー
    //--------------------------------------------------
    function updateNickname() {
        saveNickname();
        listenCurrentOrders();
    }

    elements.nicknameInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            updateNickname();
        }

    });

    //--------------------------------------------------
    // フォーカスが外れた
    //--------------------------------------------------

    elements.nicknameInput.addEventListener("blur", function () {
        updateNickname();
    });

}



//======================================
// LocalStorage
//======================================

function loadNickname() {

    const nickname = localStorage.getItem("nickname");

    if (nickname) {

        elements.nicknameInput.value = nickname;

    }

}


function saveNickname() {

    localStorage.setItem("nickname", elements.nicknameInput.value.trim());

}



//======================================
// メニュー表示
//======================================

function createMenuCards() {

    elements.menuList.innerHTML = "";

    menus.forEach(menu => {

        const card = document.createElement("div");

        card.className = "menu-card";

        card.innerHTML = `
            <div class="menu-name">

                ${menu.name}　¥${menu.price.toLocaleString()}

            </div>

            <button
                class="order-button"
                onclick="order(${menu.id})">

                注文予定

            </button>
        `;

        elements.menuList.appendChild(card);

    });

}

//======================================
// 注文
//======================================

async function order(menuId) {

    if (elements.nicknameInput.value.trim() === "") {
        alert("名前を入力してください。");
        return;
    }

    saveNickname();

    await addDoc(collection(db, "orders"), {
        nickname: elements.nicknameInput.value.trim(),
        menu_id: menuId,
        createdAt: new Date()
    });
}

//======================================
// 現在の注文取得
//======================================

function renderCurrentOrders(orders) {

    if (orders.length === 0) {

        elements.orderList.innerHTML =
            "<p>まだ注文予定がありません。</p>";

        return;

    }

    let html = "";

    html += "<div class='order-count'>";

    html += "現在 " + orders.length + " 件注文予定があります";

    html += "</div>";

    orders.forEach(order => {

        html += `

        <div class="order-card">

            <div class="order-name">

                ${getMenuName(order.menu_id)}

            </div>

            <button
                class="delete-button"
                onclick="deleteOrder('${order.id}')">

                削除

            </button>

        </div>

        `;

    });

    elements.orderList.innerHTML = html;

}


function listenCurrentOrders() {

    if (unsubscribeCurrent) {

        unsubscribeCurrent();

        unsubscribeCurrent = null;

    }

    if (elements.nicknameInput.value.trim() === "") {

        elements.orderList.innerHTML =
            "<p>まだ注文予定がありません。</p>";

        return;
    }

    const q = query(
        collection(db, "orders"),
        where("nickname", "==", elements.nicknameInput.value.trim())
    );

    unsubscribeCurrent = onSnapshot(q, (snapshot) => {

        const orders =
            snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        renderCurrentOrders(orders);
    });

}

//======================================
// 注文削除
//======================================
async function deleteOrder(orderId) {

    if (!confirm("この注文予定を削除しますか？")) {
        return;
    }

    try {

        await deleteDoc(doc(db, "orders", orderId));

    } catch (e) {

        console.error(e);

        alert("削除に失敗しました。");

    }

}


//======================================
// menu_id → メニュー名
//======================================
function getMenuName(menuId) {

    const menu =
        menus.find(m => m.id === menuId);

    if (menu) {

        return menu.name;

    }

    return "不明なメニュー";

}

//======================================
// 全員の注文取得
//======================================

function renderAllOrders(orders) {

    if (orders.length === 0) {

        elements.allOrderList.innerHTML =
            "<p>まだ注文予定がありません。</p>";

        return;

    }

    // 名前ごとにまとめる
    const groups = {};

    orders.forEach(order => {

        if (!groups[order.nickname]) {
            groups[order.nickname] = [];
        }

        groups[order.nickname].push(order);

    });

    let html = "";

    for (const nickname in groups) {

        const menuNames =
            groups[nickname]
                .map(order =>
                    getMenuName(order.menu_id))
                .join("、");

        html += `
            <div class="all-order-row">

                <span class="all-order-name">
                    ${nickname}
                </span>

                <span class="all-order-menu">
                    ${menuNames}
                </span>

            </div>
        `;
    }

    elements.allOrderList.innerHTML = html;

}

function listenAllOrders() {

    onSnapshot(
        collection(db, "orders"),
        (snapshot) => {

            const orders =
                snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

            renderAllOrders(orders);

        });

}

listenAllOrders()

window.order = order;
window.deleteOrder = deleteOrder;
