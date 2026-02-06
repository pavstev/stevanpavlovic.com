# Google Tag Manager Configuration

This document defines all GTM events that need to be configured for tracking recruiters and site visitors. Events are organized by category and include trigger configurations.

## Automation Options

### Option 1: Terraform Provider (Recommended)

Use the `mirefly/google-tag-manager` Terraform provider for configuration as code:

```hcl
terraform {
  required_providers {
    googletagmanager = {
      source  = "mirefly/google-tag-manager"
      version = "~> 0.1"
    }
  }
}

provider "googletagmanager" {
  # Configure with service account credentials
}
```

**Resources:**

- Provider: <https://registry.terraform.io/providers/mirefly/google-tag-manager/latest>
- GitHub: <https://github.com/mirefly/terraform-provider-google-tag-manager>

### Option 2: GTM API

Use the Google Tag Manager API for programmatic configuration:

- API Reference: <https://developers.google.com/tag-manager/api/v2>
- Requires OAuth 2.0 authentication
- Supports all GTM entities (tags, triggers, variables, workspaces)

### Option 3: Manual Configuration

Follow the event definitions below to manually configure in GTM UI.

---

## Event Categories

### 1. Navigation Events

#### `page_view`

##### Auto-tracked via GoogleTagManager.astro component

- **Trigger:** View Transitions (`astro:after-navigation`)
- **Variables:**
  - `page_path` (string): Current pathname

**Status:** ✅ Already implemented in code

---

### 2. Recruiter Engagement Events

#### `recruiter_action`

**Type:** Custom Event

- **Event:** `recruiter_action`
- **Action Types:**
  - `resume_download` - User downloads resume/CV
  - `contact_click` - User clicks contact/email link
  - `portfolio_view` - User views portfolio/projects page

**Variables:**

- `action` (enum): One of the action types above
- `details` (string, optional): Additional context

**Trigger Configuration:**

| Action            | Trigger Type | Conditions                                                          |
| ----------------- | ------------ | ------------------------------------------------------------------- |
| `resume_download` | Click        | Click URL contains `/resume.pdf`                                    |
| `contact_click`   | Click        | Click URL contains `mailto:` OR Click Element matches contact links |
| `portfolio_view`  | Page View    | Page Path contains `/projects` OR `/experience`                     |

**Status:** ⚠️ Partially implemented (service exists, needs tracking calls added)

---

### 3. Content Engagement Events

#### `blog_read`

**Type:** Custom Event

- **Event:** `blog_read`
- **Variables:**
  - `article_title` (string): Blog post title
  - `article_slug` (string): Blog post slug
  - `scroll_depth` (number): Percentage scrolled

**Trigger:**

- Page View on `/blog/*` pattern
- Scroll depth at 25%, 50%, 75%, 100%

**Status:** 🔴 Not implemented

---

#### `code_copy`

**Type:** Custom Event

- **Event:** `code_copy`
- **Variables:**
  - `language` (string): Programming language
  - `context` (string): Page where copy occurred

**Trigger:**

- Click on copy button in code blocks

**Status:** 🔴 Not implemented

---

### 4. Social Engagement Events

#### `social_click`

**Type:** Custom Event

- **Event:** `social_click`
- **Variables:**
  - `platform` (string): Social platform (GitHub, LinkedIn, etc.)
  - `location` (string): Where on page (header, footer, contact)

**Trigger:**

- Click on social media links

**Status:** 🔴 Not implemented

---

### 5. Interactive Elements

#### `filter_applied`

**Type:** Custom Event

- **Event:** `filter_applied`
- **Variables:**
  - `filter_type` (string): Type of filter
  - `filter_value` (string): Selected value
  - `page` (string): Page where filter was applied

**Trigger:**

- User applies filters on blog/projects pages

**Status:** 🔴 Not implemented

---

#### `modal_open`

**Type:** Custom Event

- **Event:** `modal_open`
- **Variables:**
  - `modal_type` (string): Type of modal
  - `trigger_location` (string): Where modal was triggered

**Trigger:**

- Modal component opens

**Status:** 🔴 Not implemented

---

## Implementation Checklist

### Phase 1: Core Tracking (Priority: High)

- [x] `page_view` - Already implemented
- [ ] `recruiter_action: resume_download`
- [ ] `recruiter_action: contact_click`
- [ ] `recruiter_action: portfolio_view`
- [ ] `social_click`

### Phase 2: Content Engagement (Priority: Medium)

- [ ] `blog_read` with scroll depth
- [ ] `code_copy`
- [ ] `filter_applied`

### Phase 3: Advanced (Priority: Low)

- [ ] `modal_open`
- [ ] Time on page tracking
- [ ] Engagement rate metrics

---

## GTM Container Setup

### Variables to Create

1. **Page Path** - Built-in Variable
2. **Click URL** - Built-in Variable
3. **Click Element** - Built-in Variable
4. **Scroll Depth** - Built-in Variable
5. **Custom Event Action** - Data Layer Variable (`action`)
6. **Custom Event Details** - Data Layer Variable (`details`)

### Tags to Create

1. **GA4 Configuration** - Google Analytics 4 Configuration Tag
2. **GA4 Event - Page View** - Fires on View Transitions
3. **GA4 Event - Recruiter Actions** - Fires on `recruiter_action` custom events
4. **GA4 Event - Social Clicks** - Fires on social link clicks
5. **GA4 Event - Content Engagement** - Fires on blog/code interactions

### Triggers to Create

1. **All Pages** - Page View
2. **Custom Event - recruiter_action** - Custom Event
3. **Click - Social Links** - Click with CSS selector/URL pattern
4. **Click - Resume Download** - Click on `.pdf` links
5. **Scroll Depth** - Scroll Depth (25%, 50%, 75%, 100%)

---

## Environment Variables

Ensure `.env` file contains:

```bash
PUBLIC_GTM_ID="GTM-XXXXXX"
```

Replace `GTM-XXXXXX` with your actual GTM Container ID.
