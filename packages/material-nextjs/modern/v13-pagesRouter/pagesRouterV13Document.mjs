import _extends from "@babel/runtime/helpers/esm/extends";
var _meta;
import * as React from 'react';
import createEmotionServer from '@emotion/server/create-instance';
import ImportedDocument from 'next/document';
import createEmotionCache from "./createCache.mjs";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
let Document = ImportedDocument;
if (!Document.getInitialProps) {
  // @ts-ignore
  Document = Document.default;
}
/**
 * A utility to compose multiple `getInitialProps` functions.
 */
export function createGetInitialProps(plugins) {
  return async function getInitialProps(ctx) {
    const originalRenderPage = ctx.renderPage;
    ctx.renderPage = () => originalRenderPage({
      enhanceApp: App => plugins.reduce((result, plugin) => plugin.enhanceApp(result), App)
    });
    const initialProps = await Document.getInitialProps(ctx);
    const finalProps = await plugins.reduce(async (result, plugin) => plugin.resolveProps(await result), Promise.resolve(initialProps));
    return finalProps;
  };
}
export function DocumentHeadTags(props) {
  return /*#__PURE__*/_jsxs(React.Fragment, {
    children: [_meta || (_meta = /*#__PURE__*/_jsx("meta", {
      name: "emotion-insertion-point",
      content: ""
    })), props.emotionStyleTags]
  });
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
export async function documentGetInitialProps(ctx, options) {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // You can consider sharing the same Emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = options?.emotionCache ?? createEmotionCache();
  // The createEmotionServer has to be called directly after the cache creation due to the side effect of cache.compat = true,
  // otherwise the <style> tag will not come with the HTML string from the server.
  const {
    extractCriticalToChunks
  } = createEmotionServer(cache);
  return createGetInitialProps([{
    enhanceApp: App => function EnhanceApp(props) {
      return /*#__PURE__*/_jsx(App, _extends({
        emotionCache: cache
      }, props));
    },
    resolveProps: async initialProps => {
      const {
        styles
      } = extractCriticalToChunks(initialProps.html);
      return _extends({}, initialProps, {
        emotionStyleTags: styles.map(style => /*#__PURE__*/_jsx("style", {
          "data-emotion": `${style.key} ${style.ids.join(' ')}`,
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML: {
            __html: style.css
          }
        }, style.key))
      });
    }
  }, ...(options?.plugins ?? [])])(ctx);
}