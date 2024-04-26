// tsup.config.ts
import { defineConfig } from "tsup";
import { sassPlugin } from "esbuild-sass-plugin";
import inlineImage from "esbuild-plugin-inline-image";
var env = process.env.NODE_ENV;
var tsup_config_default = defineConfig([
  {
    entry: ["src/index.ts"],
    clean: true,
    dts: true,
    format: ["esm"],
    platform: "browser",
    loader: {
      ".js": "jsx"
    },
    esbuildPlugins: [inlineImage({ limit: -1 }), sassPlugin({ type: "style" })],
    // esbuildOptions(options) {
    //   if (env === 'production') {
    //     options.drop = ['console'];
    //   }
    // },
    outExtension() {
      return {
        js: `.js`
      };
    }
  },
  {
    entry: ["src/analytics.tsx"],
    minify: true,
    format: ["iife"],
    platform: "browser",
    esbuildPlugins: [inlineImage({ limit: -1 }), sassPlugin({ type: "style" })],
    // esbuildOptions(options) {
    //   if (env === 'production') {
    //     options.drop = ['console'];
    //   }
    // },
    outExtension() {
      return {
        js: `.js`
      };
    }
  }
]);
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL2hvbWUvdmlldC92aWV0L2FwcC9hbmFseXRpY3MvdHN1cC5jb25maWcudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL2hvbWUvdmlldC92aWV0L2FwcC9hbmFseXRpY3NcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL2hvbWUvdmlldC92aWV0L2FwcC9hbmFseXRpY3MvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJztcbmltcG9ydCB7IHNhc3NQbHVnaW4gfSBmcm9tICdlc2J1aWxkLXNhc3MtcGx1Z2luJztcbmltcG9ydCBpbmxpbmVJbWFnZSBmcm9tICdlc2J1aWxkLXBsdWdpbi1pbmxpbmUtaW1hZ2UnO1xuXG5jb25zdCBlbnYgPSBwcm9jZXNzLmVudi5OT0RFX0VOVjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKFtcbiAge1xuICAgIGVudHJ5OiBbJ3NyYy9pbmRleC50cyddLFxuICAgIGNsZWFuOiB0cnVlLFxuICAgIGR0czogdHJ1ZSxcbiAgICBmb3JtYXQ6IFsnZXNtJ10sXG4gICAgcGxhdGZvcm06ICdicm93c2VyJyxcbiAgICBsb2FkZXI6IHtcbiAgICAgICcuanMnOiAnanN4JyxcbiAgICB9LFxuICAgIGVzYnVpbGRQbHVnaW5zOiBbaW5saW5lSW1hZ2UoeyBsaW1pdDogLTEgfSksIHNhc3NQbHVnaW4oeyB0eXBlOiAnc3R5bGUnIH0pXSxcbiAgICAvLyBlc2J1aWxkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgLy8gICBpZiAoZW52ID09PSAncHJvZHVjdGlvbicpIHtcbiAgICAvLyAgICAgb3B0aW9ucy5kcm9wID0gWydjb25zb2xlJ107XG4gICAgLy8gICB9XG4gICAgLy8gfSxcbiAgICBvdXRFeHRlbnNpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBqczogYC5qc2AsXG4gICAgICB9O1xuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBlbnRyeTogWydzcmMvYW5hbHl0aWNzLnRzeCddLFxuICAgIG1pbmlmeTogdHJ1ZSxcbiAgICBmb3JtYXQ6IFsnaWlmZSddLFxuICAgIHBsYXRmb3JtOiAnYnJvd3NlcicsXG4gICAgZXNidWlsZFBsdWdpbnM6IFtpbmxpbmVJbWFnZSh7IGxpbWl0OiAtMSB9KSwgc2Fzc1BsdWdpbih7IHR5cGU6ICdzdHlsZScgfSldLFxuICAgIC8vIGVzYnVpbGRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAvLyAgIGlmIChlbnYgPT09ICdwcm9kdWN0aW9uJykge1xuICAgIC8vICAgICBvcHRpb25zLmRyb3AgPSBbJ2NvbnNvbGUnXTtcbiAgICAvLyAgIH1cbiAgICAvLyB9LFxuICAgIG91dEV4dGVuc2lvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGpzOiBgLmpzYCxcbiAgICAgIH07XG4gICAgfSxcbiAgfSxcbl0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxTyxTQUFTLG9CQUFvQjtBQUNsUSxTQUFTLGtCQUFrQjtBQUMzQixPQUFPLGlCQUFpQjtBQUV4QixJQUFNLE1BQU0sUUFBUSxJQUFJO0FBRXhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCO0FBQUEsSUFDRSxPQUFPLENBQUMsY0FBYztBQUFBLElBQ3RCLE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLFFBQVEsQ0FBQyxLQUFLO0FBQUEsSUFDZCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsTUFDTixPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLE9BQU8sR0FBRyxDQUFDLEdBQUcsV0FBVyxFQUFFLE1BQU0sUUFBUSxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNMUUsZUFBZTtBQUNiLGFBQU87QUFBQSxRQUNMLElBQUk7QUFBQSxNQUNOO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPLENBQUMsbUJBQW1CO0FBQUEsSUFDM0IsUUFBUTtBQUFBLElBQ1IsUUFBUSxDQUFDLE1BQU07QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLGdCQUFnQixDQUFDLFlBQVksRUFBRSxPQUFPLEdBQUcsQ0FBQyxHQUFHLFdBQVcsRUFBRSxNQUFNLFFBQVEsQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTTFFLGVBQWU7QUFDYixhQUFPO0FBQUEsUUFDTCxJQUFJO0FBQUEsTUFDTjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
