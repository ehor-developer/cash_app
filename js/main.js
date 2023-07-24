// Function to set a cookie with an expiration date one year from now
function setCookieWithOneYearExpiration(name, value) {
    var expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/;`;
}

function getProductList() {
    var cookies = document.cookie.split(";");
    var productList = [];
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        var cookieParts = cookie.split("=");
        var productName = cookieParts[0];
        var productPrice = cookieParts[1];
        var product = {
            name: productName,
            price: productPrice
        };
        if (productPrice !== undefined) {
            // 重複する商品名をチェック
            var isDuplicate = productList.some(item => item.name === productName);
            if (!isDuplicate) {
                productList.push(product);
            }
        }
    }
    return productList;
}


// Cookieから商品情報を削除する関数
function deleteProductCookie(productName) {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        var cookieParts = cookie.split("=");
        var cookieName = cookieParts[0];
        if (cookieName === productName) {
            document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            break;
        }
    }
    window.location.reload();
}

// カートに選択された商品を一時的な配列に保存する
var cartItems = [];
// 合計料金を保持する変数
var totalPrice = 0;

// カートに商品を追加する関数
function addToCart(index) {
    var cartItems = [];
    var products = getProductList();
    var product = products[index];
    // 合計料金を更新
    totalPrice += parseInt(product.price);
    // カートに商品を追加
    cartItems.push(product);
    // HTML要素を作成
    var cartItem = document.createElement("div");
    cartItem.className = "bg-white rounded-lg shadow-lg p-4 mb-4";
    cartItem.innerHTML = `
            <div class="flex items-center mb-2">
                <div class="mr-auto">
                    <p class="text-2xl font-bold">${product.name}</p>
                    <p class="text-white bg-green-500 inline-block p-1 rounded-lg text-sm">${product.price}円</p>
                </div>
                <div class="gap-3 items-center text-right">
                    <button class="bg-red-500 text-white rounded-md py-1 px-3 hover:bg-red-600 duration-500 text-right my-2" onclick="removeFromCart(this, ${index})">削除</button>
                </div>
            </div>
        `;
    render();
    // カートに商品を追加
    var buyContainer = document.getElementById("buy-container");
    buyContainer.appendChild(cartItem);
}

// カートから商品を削除する関数
function removeFromCart(button, index) {
    var cartItem = button.closest(".bg-white.rounded-lg.shadow-lg.p-4.mb-4");
    cartItem.remove();
    // 合計料金を更新
    var products = getProductList();
    var product = products[index];
    totalPrice -= parseInt(product.price);
    // 合計料金を表示
    render();
    // カートから商品を削除した場合、カートアイテムも更新
    cartItems.splice(index, 1);
    // Cookieに商品情報を更新
    updateProductCookie();
}


// 購入処理の関数
function cash() {
    var cartItems = [];
    var oturiInput = document.getElementById("oturi");
    var oturi = parseInt(oturiInput.value);
    // 購入済み商品を削除
    var buyContainer = document.getElementById("buy-container");
    buyContainer.innerHTML = "";

    if (!isNaN(oturi)) {
        var change = oturi - totalPrice;
        if (change >= 0) {
            // お釣りが0円以上の場合、正常な計算結果を表示
            var changeElement = document.getElementById("price");
            changeElement.textContent = change + "円";
            var textElement = document.getElementById("text");
            textElement.textContent = "お釣り";
            // 購入済み商品を削除
            var buyContainer = document.getElementById("buy-container");
            buyContainer.innerHTML = "";
            // カートから商品を削除した場合、合計料金を0にリセット
            totalPrice = 0;
            // カートの商品リストを空にする
            cartItems = [];
            // Update the start() function to re-render the product list
            start();
        } else {
            // お釣りがマイナス（不足）の場合、エラーを表示
            var changeElement = document.getElementById("text");
            changeElement.textContent = "エラー: お金が足りません";
        }
    }
}

// 商品情報をCookieに保存する関数
function updateProductCookie() {
    var cookieValue = "";
    for (var i = 0; i < cartItems.length; i++) {
        var product = cartItems[i];
        var productInfo = product.name + "=" + product.price;
        cookieValue += productInfo + ";";
    }
    cookieValue = cookieValue.slice(0, -1); // 最後のセミコロンを削除
    document.cookie = cookieValue;
}

// 商品情報をCookieに登録する関数
function setProductInfo() {
    var productName = document.getElementById("productName").value;
    var productPrice = document.getElementById("productPrice").value;
    // 空白チェック
    if (productName.trim() !== "" && productPrice.trim() !== "") {
        var products = getProductList();
        // 重複する商品名をチェック
        var isDuplicate = products.some(item => item.name === productName);
        if (!isDuplicate) {
            // 商品情報をCookieに登録する
            setCookieWithOneYearExpiration(productName, productPrice);
            // input欄の値をリセットする
            document.getElementById("productName").value = "";
            document.getElementById("productPrice").value = "";
        }
    }
    window.location.reload();
}


// 合計料金を表示する関数
function render() {
    // 合計料金を表示
    var priceElement = document.getElementById("price");
    priceElement.textContent = totalPrice + "円";
    var textElement = document.getElementById("text");
    textElement.textContent = "合計金額";
}
function start() {
    // 商品情報をCookieから取得
    var products = getProductList();
    // 合計料金を保持する変数
    totalPrice = 0;
    // 購入済み商品を削除
    var buyContainer = document.getElementById("buy-container");
    buyContainer.innerHTML = "";

    // 商品情報をHTMLにテンプレートとして適用
    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        // HTMLのテンプレートを作成
        var template = `
        <div class="bg-white rounded-lg shadow-lg p-4 mb-4">
            <div class="flex items-center mb-2">
                <div class="mr-auto">
                    <p class="text-2xl font-bold">${product.name}</p>
                    <p class="text-white bg-green-500 inline-block p-1 rounded-lg text-sm">${product.price}円</p>
                </div>
                <div class="gap-3 items-center text-right">
                    <button class="bg-green-500 text-white rounded-md py-1 px-3 hover:bg-red-600 duration-500 text-right my-2" onclick="addToCart(${i})">追加</button>
                    <button class="bg-red-500 text-white rounded-md py-1 px-3 hover:bg-red-600 duration-500 text-right my-2" onclick="deleteProductCookie('${product.name}')">削除</button>
                </div>
            </div>
        </div>
        `;
        // HTMLにテンプレートを追加
        var container = document.getElementById("product-container");
        container.innerHTML += template;
    }
}

// 初期表示
start();
