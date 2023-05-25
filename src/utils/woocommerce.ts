import { trackEvent } from '.';
type AttributeType = { name: string; value: string };

const hostUrl = window['aesirx1stparty'] ? window['aesirx1stparty'] : '';
const root = hostUrl ? hostUrl.replace(/\/$/, '') : '';

const addToCartAnalytics = () => {
  const singleAddTocart = Array.from(
    document.querySelectorAll('.cart:not(.variations_form) .single_add_to_cart_button')
  );
  singleAddTocart.forEach((item: any) => {
    item.addEventListener('click', () => {
      const title = item.closest('.product').querySelector('.product_title')?.innerText;
      const quantity = item.closest('.product').querySelector('input[name="quantity"]').value;
      if (!item.classList.contains('disabled')) {
        trackEventAddToCart(title, item.value, quantity);
      }
    });
  });

  const singleAddTocartShopList = Array.from(
    document.querySelectorAll('.add_to_cart_button.product_type_simple')
  );
  singleAddTocartShopList.forEach((item: any) => {
    item.addEventListener('click', () => {
      const title = item
        .closest('.product')
        .querySelector('.woocommerce-loop-product__title')?.innerText;
      if (!item.classList.contains('disabled')) {
        trackEventAddToCart(title, item.dataset.product_id, '1');
      }
    });
  });

  const multipleAddTocart = Array.from(
    document.querySelectorAll('.cart.variations_form .single_add_to_cart_button')
  );
  multipleAddTocart.forEach((item: any) => {
    item.addEventListener('click', () => {
      const title = item.closest('.product').querySelector('.product_title')?.innerText;
      const quantity = item.closest('.product').querySelector('input[name="quantity"]').value;
      const productID = item.closest('.product').querySelector('input[name="product_id"]').value;
      const variationID = item
        .closest('.product')
        .querySelector('input[name="variation_id"]').value;
      if (!item.classList.contains('disabled')) {
        trackEventAddToCart(title, productID, quantity, variationID);
      }
    });
  });

  const trackEventAddToCart = (
    title: string,
    productID: string,
    quantity: string = null,
    variantID: string = null
  ) => {
    const attributes = Array<AttributeType>();

    pushAttr(attributes, title, 'wooocommerce_product_name');
    pushAttr(attributes, productID, 'wooocommerce_product_id');
    pushAttr(attributes, quantity, 'wooocommerce_quantity');
    pushAttr(attributes, variantID, 'wooocommerce_variant_id');

    trackEvent(root, '', '', {
      event_name: 'Add to cart',
      event_type: 'submit',
      attributes: attributes,
    });
  };
};

const searchAnalytics = () => {
  const searchButton = Array.from(
    document.querySelectorAll('form[role="search"] button[type="submit"]')
  );
  searchButton.forEach((item: any) => {
    item.addEventListener('click', () => {
      const searchValue = item.closest('form').querySelector('input[type="search"]')?.value;
      if (
        !item.classList.contains('disabled') &&
        item.closest('form').querySelector('input[name="post_type"]')?.value === 'product'
      ) {
        trackEventSearch(searchValue);
      }
    });
  });
  const trackEventSearch = (searchValue: string) => {
    const attributes = Array<AttributeType>();
    pushAttr(attributes, searchValue, 'wooocommerce_search');

    trackEvent(root, '', '', {
      event_name: 'Search product',
      event_type: 'submit',
      attributes: attributes,
    });
  };
};

const checkoutAnalytics = () => {
  document.querySelector('form.woocommerce-checkout')?.addEventListener('submit', function (e) {
    jQuery('form.woocommerce-checkout').on('checkout_place_order', function () {
      const form = e.target as HTMLElement;
      const attributes = Array<AttributeType>();

      // Order List
      const listProductSelector = form.querySelectorAll('.cart_item');
      listProductSelector.forEach((item, index) => {
        // get Name
        const productNameSelector = item.querySelector('.product-name');
        let productName = '';
        for (let i = 0; i < productNameSelector.childNodes.length; ++i) {
          if (productNameSelector.childNodes[i].nodeType === Node.TEXT_NODE)
            productName += productNameSelector.childNodes[i].textContent;
        }
        pushAttr(attributes, productName.trim(), 'product-' + index + '-name');

        // get Quantity
        const productQuantity = (
          item.querySelector('.product-quantity') as HTMLElement
        ).innerText?.replace('×', '');
        pushAttr(attributes, productQuantity.trim(), 'product-' + index + '-quantity');

        // get Price
        const productPriceSelector = item.querySelector('.woocommerce-Price-amount bdi');
        let productPrice = '';
        for (let i = 0; i < productPriceSelector.childNodes.length; ++i) {
          if (productPriceSelector.childNodes[i].nodeType === Node.TEXT_NODE)
            productPrice += productPriceSelector.childNodes[i].textContent;
        }
        pushAttr(attributes, productPrice.trim(), 'product-' + index + '-price');
      });

      // Order total
      const orderTotalSelect = form.querySelector('.order-total .woocommerce-Price-amount bdi');
      let orderTotal = '';
      for (let i = 0; i < orderTotalSelect.childNodes.length; ++i) {
        if (orderTotalSelect.childNodes[i].nodeType === Node.TEXT_NODE)
          orderTotal += orderTotalSelect.childNodes[i].textContent;
      }
      pushAttr(attributes, orderTotal.trim(), 'order-total');

      // Billing
      const billing_first_name = form.querySelector('input[name="billing_first_name"]');
      const billing_last_name = form.querySelector('input[name="billing_last_name"]');
      const billing_company = form.querySelector('input[name="billing_company"]');
      const billing_address_1 = form.querySelector('input[name="billing_address_1"]');
      const billing_address_2 = form.querySelector('input[name="billing_address_2"]');
      const billing_postcode = form.querySelector('input[name="billing_postcode"]');
      const billing_city = form.querySelector('input[name="billing_city"]');
      const billing_state = form.querySelector('input[name="billing_state"]');
      const billing_phone = form.querySelector('input[name="billing_phone"]');
      const billing_email = form.querySelector('input[name="billing_email"]');
      const shipping_first_name = form.querySelector('input[name="shipping_first_name"]');
      const shipping_last_name = form.querySelector('input[name="shipping_last_name"]');
      const shipping_company = form.querySelector('input[name="shipping_company"]');
      const shipping_address_1 = form.querySelector('input[name="shipping_address_1"]');
      const shipping_address_2 = form.querySelector('input[name="shipping_address_2"]');
      const shipping_postcode = form.querySelector('input[name="shipping_postcode"]');
      const shipping_city = form.querySelector('input[name="shipping_city"]');
      const shipping_state = form.querySelector('input[name="shipping_state"]');
      const shipping_method_selector = form.querySelectorAll('input[name="shipping_method[0]"]');

      const payment_method_selector = form.querySelectorAll('input[name="payment_method"]');

      const mailpoet_woocommerce_checkout_optin = form.querySelector(
        'input[name="mailpoet_woocommerce_checkout_optin"]'
      );

      let payment_method = '';
      payment_method_selector?.forEach((item) => {
        if ((item as HTMLInputElement).checked) {
          payment_method = (item as HTMLInputElement).value;
        }
      });

      let shipping_method = '';
      shipping_method_selector?.forEach((item) => {
        if ((item as HTMLInputElement).checked) {
          shipping_method = (item as HTMLInputElement).value;
        }
      });

      pushAttr(attributes, (billing_first_name as HTMLInputElement).value, 'billing_first_name');
      pushAttr(attributes, (billing_last_name as HTMLInputElement).value, 'billing_last_name');
      pushAttr(attributes, (billing_company as HTMLInputElement).value, 'billing_company');
      pushAttr(attributes, (billing_address_1 as HTMLInputElement).value, 'billing_address_1');
      pushAttr(attributes, (billing_address_2 as HTMLInputElement).value, 'billing_address_2');
      pushAttr(attributes, (billing_postcode as HTMLInputElement).value, 'billing_postcode');
      pushAttr(attributes, (billing_city as HTMLInputElement).value, 'billing_city');
      pushAttr(attributes, (billing_state as HTMLInputElement).value, 'billing_state');
      pushAttr(attributes, (billing_phone as HTMLInputElement).value, 'billing_phone');
      pushAttr(attributes, (billing_email as HTMLInputElement).value, 'billing_email');

      pushAttr(attributes, (shipping_first_name as HTMLInputElement).value, 'shipping_first_name');
      pushAttr(attributes, (shipping_last_name as HTMLInputElement).value, 'shipping_last_name');
      pushAttr(attributes, (shipping_company as HTMLInputElement).value, 'shipping_company');
      pushAttr(attributes, (shipping_address_1 as HTMLInputElement).value, 'shipping_address_1');
      pushAttr(attributes, (shipping_address_2 as HTMLInputElement).value, 'shipping_address_2');
      pushAttr(attributes, (shipping_postcode as HTMLInputElement).value, 'shipping_postcode');
      pushAttr(attributes, (shipping_city as HTMLInputElement).value, 'shipping_city');
      pushAttr(attributes, (shipping_state as HTMLInputElement).value, 'shipping_state');

      pushAttr(attributes, shipping_method, 'shipping_method');
      pushAttr(attributes, payment_method, 'payment_method');
      pushAttr(
        attributes,
        (mailpoet_woocommerce_checkout_optin as HTMLInputElement).value,
        'mailpoet_woocommerce_checkout_optin'
      );

      trackEvent(root, '', '', {
        event_name: 'Checkout',
        event_type: 'submit',
        attributes: attributes,
      });
    });
  });
};

const pushAttr = (arr: Array<AttributeType>, attrValue: string, attrLabel: string) => {
  attrValue &&
    arr.push({
      name: attrLabel,
      value: attrValue ?? '',
    });
};

export { addToCartAnalytics, searchAnalytics, checkoutAnalytics };
