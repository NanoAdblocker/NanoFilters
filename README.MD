# Nano Filters

Script snippets and filters for Nano Adblocker

These resources are designed for Nano Adblocker and may not always work as
expected with uBlock Origin out of the box. See
[Filter Syntax Differences](https://github.com/NanoAdblocker/NanoDoc/blob/master/en/FilterSyntax.MD)
for more details.

Third party filters were cached on 2018-12-17. Cache will be updated on every
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
- It is for an automatic mining wall, an ads reward system (the user gets
  something after watching ads), or an advertiser backend

If we consider appropriate and if possible, these forms of annoyance may be
removed:
- Hostile anti-copy
- Hostile anti-select
- Hostile anti-right-click
- Hostile anti-blur (switching to another tab or window)
- Forced like (social locker)
- Intrusive donation message
- Cookie wall
- Fake pay wall and fake login wall (a wall is fake if it does not work when
  JavaScript and/or cookies are disabled in browser settings)

Regular cookie notices are to be handled in Fanboy Cookie List; tracking
scripts are to be handled in EasyPrivacy; ads placeholders are to be handled in
EasyList or NanoContrib.

**Note: Annoyance filters are not subscribed by default.**

## Filter Quality Guideline

Filter rules should be reasonably fine-grained and efficient.

Deprecated features should never be used.

Third party whitelists must be added to `Nano filters – Whitelist`.

`Nano filters` and `Nano filters - Whitelist` should keep compatibility with
uBlock Origin when possible.
