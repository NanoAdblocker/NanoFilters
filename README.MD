# Nano Filters

Script snippets and filters for Nano Adblocker

These resources are designed for Nano Adblocker and may not always work as
expected with uBlock Origin out of the box. See
[filter syntax](https://github.com/NanoAdblocker/NanoCore/blob/master/notes/filter-syntax.MD#filter-syntax)
for more details.

Third party filters were cached on 2018-03-18. Cache will be updated on every
release of Nano Adblocker.

Please open an issue if there is something you want us to know.

## Filter Policy

If an issue is taken care by a default (regional) filter, then it will not be
fixed again in NanoFilters.

Ads and ads timer will be removed unless:
- It is non-intrusive, and
- It only promote first party products (for example, the Android app for your
  website)

Any form of anti-adblock will be removed unless:
- It is non-intrusive, and
- It is for an automatic mining wall or an ads reward system (the user gets
  something after watching ads)

If we consider appropriate and if possible, these forms of annoyance may be
removed:
- Hostile anti-copy
- Hostile anti-select
- Hostile anti-right-click
- Hostile anti-unfocus (like switching to another tab or window)
- Forced like (a post on social media)
- Intrusive donation message
- Cookie wall
- Fake (and only fake) pay wall (a pay wall is fake if it does not work when
  JavaScript and/or cookies are disabled in browser settings)

Cookie notices are to be handled in Cookiemonster; tracking scripts are to be
handled in EasyPrivacy or uAssets.

## Filter Quality Guideline

Filter rules should be reasonably fine-grained and efficient.

Deprecated features should never be used.

Third party whitelists must be added to `Nano filters – Whitelist`.

`Nano filters` and `Nano filters - Whitelist` should keep compatibility with
uBlock Origin when possible.
