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
      const title = item.closest('.product').querySelector('.woocommerce-loop-product__title')
        ?.innerText;
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
    const attributesJSON = <any>{};

    attributesJSON['product_name'] = title;
    attributesJSON['product_id'] = productID;
    if (variantID) {
      attributesJSON['variant_id'] = variantID;
    }
    attributesJSON['quantity'] = quantity;

    trackEvent(root, '', {
      event_name: 'Add to cart',
      event_type: 'submit',
      attributes: [{ name: 'woo.addtocart', value: JSON.stringify(attributesJSON) }],
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
    pushAttr(attributes, '1', 'analytics_woocommerce');
    pushAttr(attributes, searchValue, 'wooocommerce_search');

    trackEvent(root, '', {
      event_name: 'Search product',
      event_type: 'submit',
      attributes: attributes,
    });
  };
};

const checkoutAnalytics = () => {
  document.querySelector('form.woocommerce-checkout')?.addEventListener('submit', function (e) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jQuery('form.woocommerce-checkout').on('checkout_place_order', function () {
      const form = e.target as HTMLElement;
      const attributesJSON = <any>{};
      const productList = <any>[];

      // Order List
      const listProductSelector = form.querySelectorAll('.cart_item');
      listProductSelector.forEach((item) => {
        // get Name
        const productNameSelector = item.querySelector('.product-name');
        let productName = '';
        for (let i = 0; i < productNameSelector.childNodes.length; ++i) {
          if (productNameSelector.childNodes[i].nodeType === Node.TEXT_NODE)
            productName += productNameSelector.childNodes[i]?.textContent;
        }

        // get Quantity
        const productQuantity = (
          item.querySelector('.product-quantity') as HTMLElement
        ).innerText?.replace('×', '');

        // get Price
        const productPriceSelector = item.querySelector('.woocommerce-Price-amount bdi');
        let productPrice = '';
        for (let i = 0; i < productPriceSelector.childNodes.length; ++i) {
          if (productPriceSelector.childNodes[i].nodeType === Node.TEXT_NODE)
            productPrice += productPriceSelector.childNodes[i]?.textContent;
        }

        const productSymbolSelector = item.querySelector(
          '.woocommerce-Price-amount .woocommerce-Price-currencySymbol'
        ) as HTMLElement;
        productList.push({
          name: productName?.trim(),
          quantity: productQuantity?.trim(),
          price: productPrice?.trim(),
          symbol: productSymbolSelector?.innerText,
        });
      });
      attributesJSON['products'] = productList;
      // Order total
      const orderTotalSelect = form.querySelector('.order-total .woocommerce-Price-amount bdi');
      let orderTotal = '';
      for (let i = 0; i < orderTotalSelect.childNodes.length; ++i) {
        if (orderTotalSelect.childNodes[i].nodeType === Node.TEXT_NODE)
          orderTotal += orderTotalSelect.childNodes[i]?.textContent;
      }
      attributesJSON['order-total'] = orderTotal?.trim();
      // pushAttr(attributes, orderTotal.trim(), 'order-total');

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
          payment_method = (item as HTMLInputElement)?.value;
        }
      });

      let shipping_method = '';
      shipping_method_selector?.forEach((item) => {
        if ((item as HTMLInputElement).checked) {
          shipping_method = (item as HTMLInputElement)?.value;
        }
      });

      attributesJSON['billing_first_name'] = (billing_first_name as HTMLInputElement)?.value;
      attributesJSON['billing_last_name'] = (billing_last_name as HTMLInputElement)?.value;
      attributesJSON['billing_company'] = (billing_company as HTMLInputElement)?.value;
      attributesJSON['billing_address_1'] = (billing_address_1 as HTMLInputElement)?.value;
      attributesJSON['billing_address_2'] = (billing_address_2 as HTMLInputElement)?.value;
      attributesJSON['billing_postcode'] = (billing_postcode as HTMLInputElement)?.value;
      attributesJSON['billing_city'] = (billing_city as HTMLInputElement)?.value;
      attributesJSON['billing_state'] = (billing_state as HTMLInputElement)?.value;
      attributesJSON['billing_phone'] = (billing_phone as HTMLInputElement)?.value;
      attributesJSON['billing_email'] = (billing_email as HTMLInputElement)?.value;

      attributesJSON['shipping_first_name'] = (shipping_first_name as HTMLInputElement).value;
      attributesJSON['shipping_last_name'] = (shipping_last_name as HTMLInputElement).value;
      attributesJSON['shipping_company'] = (shipping_company as HTMLInputElement)?.value;
      attributesJSON['shipping_address_1'] = (shipping_address_1 as HTMLInputElement)?.value;
      attributesJSON['shipping_address_2'] = (shipping_address_2 as HTMLInputElement)?.value;
      attributesJSON['shipping_postcode'] = (shipping_postcode as HTMLInputElement)?.value;
      attributesJSON['shipping_city'] = (shipping_city as HTMLInputElement)?.value;
      attributesJSON['shipping_state'] = (shipping_state as HTMLInputElement)?.value;

      attributesJSON['shipping_method'] = shipping_method;
      attributesJSON['payment_method'] = payment_method;
      attributesJSON['mailpoet_woocommerce_checkout_optin'] = (
        mailpoet_woocommerce_checkout_optin as HTMLInputElement
      )?.value;
      trackEvent(root, '', {
        event_name: 'Checkout',
        event_type: 'submit',
        attributes: [{ name: 'woo.checkout', value: JSON.stringify(attributesJSON) }],
      });
    });
  });
};

const viewProductAnalytics = () => {
  if(document.body.classList.contains('woocommerce') && document.body.classList.contains('single-product')) {
    const productName = (
      document.querySelector('.wp-block-post-title') as HTMLElement
    )?.innerText;
    if(productName) {
      const attributes = Array<AttributeType>();
      pushAttr(attributes, productName, 'woo.view_product');
      trackEvent(root, '', {
        event_name: 'View product',
        event_type: 'view',
        attributes: attributes,
      });
    }
  }
};

const pushAttr = (arr: Array<AttributeType>, attrValue: string, attrLabel: string) => {
  attrValue &&
    arr.push({
      name: attrLabel,
      value: attrValue ?? '',
    });
};

export { addToCartAnalytics, searchAnalytics, checkoutAnalytics, viewProductAnalytics };
