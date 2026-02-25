/**
 * GitHub Events API Zod Schema - Complete Version
 * Based on: https://docs.github.com/en/rest/using-the-rest-api/github-event-types?apiVersion=2022-11-28
 * 
 * Note: SponsorshipEvent is NOT available in the Events API, only as a webhook event.
 * This schema includes all event types available via the Events API endpoints.
 */
import { z } from 'zod';

// ============================================================================
// Common Schemas - Complete field definitions from Octokit types
// ============================================================================

/**
 * User object - Complete definition
 */
const UserSchema = z.object({
  login: z.string(),
  id: z.number(),
  node_id: z.string(),
  avatar_url: z.string(),
  gravatar_id: z.string().nullable(),
  url: z.string(),
  html_url: z.string(),
  followers_url: z.string(),
  following_url: z.string(),
  gists_url: z.string(),
  starred_url: z.string(),
  subscriptions_url: z.string(),
  organizations_url: z.string(),
  repos_url: z.string(),
  events_url: z.string(),
  received_events_url: z.string(),
  type: z.string(),
  site_admin: z.boolean(),
  name: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  blog: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  hireable: z.boolean().nullable().optional(),
  bio: z.string().nullable().optional(),
  twitter_username: z.string().nullable().optional(),
  public_repos: z.number().optional(),
  public_gists: z.number().optional(),
  followers: z.number().optional(),
  following: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/**
 * Simple User object - Used in many places
 */
const SimpleUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  node_id: z.string(),
  avatar_url: z.string(),
  gravatar_id: z.string().nullable(),
  url: z.string(),
  html_url: z.string(),
  followers_url: z.string(),
  following_url: z.string(),
  gists_url: z.string(),
  starred_url: z.string(),
  subscriptions_url: z.string(),
  organizations_url: z.string(),
  repos_url: z.string(),
  events_url: z.string(),
  received_events_url: z.string(),
  type: z.string(),
  site_admin: z.boolean(),
});

/**
 * Actor object - The user that triggered the event
 */
const ActorSchema = z.object({
  id: z.number(),
  login: z.string(),
  display_login: z.string().optional(),
  gravatar_id: z.string(),
  url: z.string(),
  avatar_url: z.string(),
});

/**
 * Repository object - Complete definition
 */
const RepositorySchema = z.object({
  id: z.number(),
  node_id: z.string(),
  name: z.string(),
  full_name: z.string(),
  owner: SimpleUserSchema,
  private: z.boolean(),
  html_url: z.string(),
  description: z.string().nullable(),
  fork: z.boolean(),
  url: z.string(),
  archive_url: z.string(),
  assignees_url: z.string(),
  blobs_url: z.string(),
  branches_url: z.string(),
  collaborators_url: z.string(),
  comments_url: z.string(),
  commits_url: z.string(),
  compare_url: z.string(),
  contents_url: z.string(),
  contributors_url: z.string(),
  deployments_url: z.string(),
  downloads_url: z.string(),
  events_url: z.string(),
  forks_url: z.string(),
  git_commits_url: z.string(),
  git_refs_url: z.string(),
  git_tags_url: z.string(),
  git_url: z.string().optional(),
  issue_comment_url: z.string(),
  issue_events_url: z.string(),
  issues_url: z.string(),
  keys_url: z.string(),
  labels_url: z.string(),
  languages_url: z.string(),
  merges_url: z.string(),
  milestones_url: z.string(),
  notifications_url: z.string(),
  pulls_url: z.string(),
  releases_url: z.string(),
  ssh_url: z.string().optional(),
  stargazers_url: z.string(),
  statuses_url: z.string(),
  subscribers_url: z.string(),
  subscription_url: z.string(),
  tags_url: z.string(),
  teams_url: z.string(),
  trees_url: z.string(),
  clone_url: z.string().optional(),
  mirror_url: z.string().nullable().optional(),
  hooks_url: z.string(),
  svn_url: z.string().optional(),
  homepage: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  forks_count: z.number(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  size: z.number(),
  default_branch: z.string(),
  open_issues_count: z.number(),
  is_template: z.boolean().optional(),
  topics: z.array(z.string()).optional(),
  has_issues: z.boolean(),
  has_projects: z.boolean(),
  has_wiki: z.boolean(),
  has_pages: z.boolean(),
  has_downloads: z.boolean(),
  has_discussions: z.boolean().optional(),
  archived: z.boolean(),
  disabled: z.boolean(),
  visibility: z.string().optional(),
  pushed_at: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  permissions: z.object({
    admin: z.boolean(),
    push: z.boolean(),
    pull: z.boolean(),
  }).optional(),
  allow_rebase_merge: z.boolean().optional(),
  allow_squash_merge: z.boolean().optional(),
  allow_merge_commit: z.boolean().optional(),
  allow_auto_merge: z.boolean().optional(),
  delete_branch_on_merge: z.boolean().optional(),
  allow_forking: z.boolean().optional(),
  web_commit_signoff_required: z.boolean().optional(),
});

/**
 * Simple Repository object - Used in events
 */
const RepoSchema = z.object({
  id: z.number(),
  name: z.string(), // Format: "owner/repo"
  url: z.string(),
});

/**
 * Organization object
 */
const OrgSchema = z.object({
  id: z.number(),
  login: z.string(),
  gravatar_id: z.string(),
  url: z.string(),
  avatar_url: z.string(),
});

/**
 * Label object - Complete definition
 */
const LabelSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  url: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string(),
  default: z.boolean(),
});

/**
 * Milestone object - Complete definition
 */
const MilestoneSchema = z.object({
  url: z.string(),
  html_url: z.string(),
  labels_url: z.string(),
  id: z.number(),
  node_id: z.string(),
  number: z.number(),
  state: z.enum(['open', 'closed']),
  title: z.string(),
  description: z.string().nullable(),
  creator: SimpleUserSchema.nullable(),
  open_issues: z.number(),
  closed_issues: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
  due_on: z.string().nullable(),
});

/**
 * Issue object - Complete definition
 */
const IssueSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  url: z.string(),
  repository_url: z.string(),
  labels_url: z.string(),
  comments_url: z.string(),
  events_url: z.string(),
  html_url: z.string(),
  number: z.number(),
  state: z.string(),
  state_reason: z.string().nullable().optional(),
  title: z.string(),
  body: z.string().nullable(),
  user: SimpleUserSchema.nullable(),
  labels: z.array(z.union([
    z.string(),
    LabelSchema,
  ])),
  assignee: SimpleUserSchema.nullable(),
  assignees: z.array(SimpleUserSchema).optional(),
  milestone: MilestoneSchema.nullable(),
  locked: z.boolean(),
  active_lock_reason: z.string().nullable().optional(),
  comments: z.number(),
  pull_request: z.object({
    merged_at: z.string().nullable().optional(),
    diff_url: z.string().nullable(),
    html_url: z.string().nullable(),
    patch_url: z.string().nullable(),
    url: z.string().nullable(),
  }).optional(),
  closed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_by: SimpleUserSchema.nullable().optional(),
  author_association: z.string().optional(),
  draft: z.boolean().optional(),
  reactions: z.object({
    url: z.string(),
    total_count: z.number(),
    '+1': z.number(),
    '-1': z.number(),
    laugh: z.number(),
    hooray: z.number(),
    confused: z.number(),
    heart: z.number(),
    rocket: z.number(),
    eyes: z.number(),
  }).optional(),
  timeline_url: z.string().optional(),
  performed_via_github_app: z.any().nullable().optional(),
});

/**
 * Pull Request object - Complete definition
 */
const PullRequestSchema = z.object({
  url: z.string(),
  id: z.number(),
  node_id: z.string(),
  html_url: z.string(),
  diff_url: z.string(),
  patch_url: z.string(),
  issue_url: z.string(),
  commits_url: z.string(),
  review_comments_url: z.string(),
  review_comment_url: z.string(),
  comments_url: z.string(),
  statuses_url: z.string(),
  number: z.number(),
  state: z.enum(['open', 'closed']),
  locked: z.boolean(),
  title: z.string(),
  user: SimpleUserSchema.nullable(),
  body: z.string().nullable(),
  labels: z.array(LabelSchema),
  milestone: MilestoneSchema.nullable(),
  active_lock_reason: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
  merged_at: z.string().nullable(),
  merge_commit_sha: z.string().nullable(),
  assignee: SimpleUserSchema.nullable(),
  assignees: z.array(SimpleUserSchema).optional(),
  requested_reviewers: z.array(SimpleUserSchema).optional(),
  requested_teams: z.array(z.object({
    id: z.number(),
    node_id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    privacy: z.string().optional(),
    permission: z.string(),
    permissions: z.object({
      pull: z.boolean(),
      triage: z.boolean(),
      push: z.boolean(),
      maintain: z.boolean(),
      admin: z.boolean(),
    }).optional(),
    url: z.string(),
    html_url: z.string(),
    members_url: z.string(),
    repositories_url: z.string(),
    parent: z.any().nullable(),
  })).optional(),
  head: z.object({
    label: z.string(),
    ref: z.string(),
    sha: z.string(),
    user: SimpleUserSchema.nullable(),
    repo: RepositorySchema.nullable(),
  }),
  base: z.object({
    label: z.string(),
    ref: z.string(),
    sha: z.string(),
    user: SimpleUserSchema.nullable(),
    repo: RepositorySchema.nullable(),
  }),
  _links: z.object({
    self: z.object({ href: z.string() }),
    html: z.object({ href: z.string() }),
    issue: z.object({ href: z.string() }),
    comments: z.object({ href: z.string() }),
    review_comments: z.object({ href: z.string() }),
    review_comment: z.object({ href: z.string() }),
    commits: z.object({ href: z.string() }),
    statuses: z.object({ href: z.string() }),
  }),
  author_association: z.string(),
  auto_merge: z.any().nullable().optional(),
  draft: z.boolean().optional(),
  merged: z.boolean().optional(),
  mergeable: z.boolean().nullable().optional(),
  rebaseable: z.boolean().nullable().optional(),
  mergeable_state: z.string().optional(),
  merged_by: SimpleUserSchema.nullable().optional(),
  comments: z.number().optional(),
  review_comments: z.number().optional(),
  maintainer_can_modify: z.boolean().optional(),
  commits: z.number().optional(),
  additions: z.number().optional(),
  deletions: z.number().optional(),
  changed_files: z.number().optional(),
});

/**
 * Simplified Pull Request object - Used in Events API (PullRequestEvent, etc.)
 * The Events API returns a minimal version of pull_request, not the full object.
 * @see https://docs.github.com/en/rest/using-the-rest-api/github-event-types#pullrequestevent
 */
const SimplePullRequestSchema = z.object({
  url: z.string(),
  id: z.number(),
  number: z.number(),
  head: z.object({
    ref: z.string(),
    sha: z.string(),
    repo: z.object({
      id: z.number(),
      url: z.string(),
      name: z.string(),
    }).nullable(),
  }),
  base: z.object({
    ref: z.string(),
    sha: z.string(),
    repo: z.object({
      id: z.number(),
      url: z.string(),
      name: z.string(),
    }).nullable(),
  }),
});

/**
 * Comment object - Complete definition for issue/PR comments
 */
const IssueCommentSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  url: z.string(),
  html_url: z.string(),
  body: z.string(),
  body_text: z.string().optional(),
  body_html: z.string().optional(),
  user: SimpleUserSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  issue_url: z.string().optional(),
  author_association: z.string().optional(),
  performed_via_github_app: z.any().nullable().optional(),
  reactions: z.object({
    url: z.string(),
    total_count: z.number(),
    '+1': z.number(),
    '-1': z.number(),
    laugh: z.number(),
    hooray: z.number(),
    confused: z.number(),
    heart: z.number(),
    rocket: z.number(),
    eyes: z.number(),
  }).optional(),
});

/**
 * Commit Comment object - Complete definition
 */
const CommitCommentSchema = z.object({
  html_url: z.string(),
  url: z.string(),
  id: z.number(),
  node_id: z.string(),
  body: z.string(),
  path: z.string().nullable(),
  position: z.number().nullable(),
  line: z.number().nullable(),
  commit_id: z.string(),
  user: SimpleUserSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  author_association: z.string(),
  reactions: z.object({
    url: z.string(),
    total_count: z.number(),
    '+1': z.number(),
    '-1': z.number(),
    laugh: z.number(),
    hooray: z.number(),
    confused: z.number(),
    heart: z.number(),
    rocket: z.number(),
    eyes: z.number(),
  }).optional(),
});

/**
 * Pull Request Review object - Complete definition
 */
const PullRequestReviewSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  user: SimpleUserSchema.nullable(),
  body: z.string().nullable(),
  state: z.string(),
  html_url: z.string(),
  pull_request_url: z.string(),
  author_association: z.string().optional(),
  _links: z.object({
    html: z.object({ href: z.string() }),
    pull_request: z.object({ href: z.string() }),
  }),
  submitted_at: z.string().optional(),
  commit_id: z.string(),
});

/**
 * Pull Request Review Comment object - Complete definition
 */
const PullRequestReviewCommentSchema = z.object({
  url: z.string(),
  pull_request_review_id: z.number().nullable(),
  id: z.number(),
  node_id: z.string(),
  diff_hunk: z.string(),
  path: z.string(),
  position: z.number().nullable().optional(),
  original_position: z.number().optional(),
  commit_id: z.string(),
  original_commit_id: z.string(),
  in_reply_to_id: z.number().optional(),
  user: SimpleUserSchema.nullable(),
  body: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  html_url: z.string(),
  pull_request_url: z.string(),
  author_association: z.string(),
  _links: z.object({
    self: z.object({ href: z.string() }),
    html: z.object({ href: z.string() }),
    pull_request: z.object({ href: z.string() }),
  }),
  start_line: z.number().nullable().optional(),
  original_start_line: z.number().nullable().optional(),
  start_side: z.enum(['LEFT', 'RIGHT']).nullable().optional(),
  line: z.number().optional(),
  original_line: z.number().optional(),
  side: z.enum(['LEFT', 'RIGHT']).optional(),
  reactions: z.object({
    url: z.string(),
    total_count: z.number(),
    '+1': z.number(),
    '-1': z.number(),
    laugh: z.number(),
    hooray: z.number(),
    confused: z.number(),
    heart: z.number(),
    rocket: z.number(),
    eyes: z.number(),
  }).optional(),
  body_html: z.string().optional(),
  body_text: z.string().optional(),
});

/**
 * Release object - Complete definition
 */
const ReleaseSchema = z.object({
  url: z.string(),
  html_url: z.string(),
  assets_url: z.string(),
  upload_url: z.string(),
  tarball_url: z.string().nullable(),
  zipball_url: z.string().nullable(),
  id: z.number(),
  node_id: z.string(),
  tag_name: z.string(),
  target_commitish: z.string(),
  name: z.string().nullable(),
  body: z.string().nullable(),
  draft: z.boolean(),
  prerelease: z.boolean(),
  created_at: z.string(),
  published_at: z.string().nullable(),
  author: SimpleUserSchema,
  assets: z.array(z.object({
    url: z.string(),
    browser_download_url: z.string(),
    id: z.number(),
    node_id: z.string(),
    name: z.string(),
    label: z.string().nullable(),
    state: z.string(),
    content_type: z.string(),
    size: z.number(),
    download_count: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    uploader: SimpleUserSchema.nullable(),
  })),
  body_html: z.string().optional(),
  body_text: z.string().optional(),
  mentions_count: z.number().optional(),
  discussion_url: z.string().optional(),
  reactions: z.object({
    url: z.string(),
    total_count: z.number(),
    '+1': z.number(),
    '-1': z.number(),
    laugh: z.number(),
    hooray: z.number(),
    confused: z.number(),
    heart: z.number(),
    rocket: z.number(),
    eyes: z.number(),
  }).optional(),
});

/**
 * Base event properties common to all events
 */
const BaseEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  actor: ActorSchema,
  repo: RepoSchema,
  public: z.boolean(),
  created_at: z.string(), // ISO 8601 formatted date
  org: OrgSchema.optional(),
});

// ============================================================================
// Payload Schemas for Each Event Type - With complete field definitions
// ============================================================================

/**
 * CommitCommentEvent payload
 */
const CommitCommentEventPayloadSchema = z.object({
  action: z.literal('created'),
  comment: CommitCommentSchema,
});

/**
 * CreateEvent payload
 */
const CreateEventPayloadSchema = z.object({
  ref: z.string().nullable(),
  ref_type: z.enum(['branch', 'tag', 'repository']),
  master_branch: z.string(),
  description: z.string().nullable(),
  pusher_type: z.string(),
});

/**
 * DeleteEvent payload
 */
const DeleteEventPayloadSchema = z.object({
  ref: z.string(),
  ref_type: z.enum(['branch', 'tag']),
  pusher_type: z.string().optional(),
});

/**
 * ForkEvent payload
 */
const ForkEventPayloadSchema = z.object({
  forkee: RepositorySchema,
});

/**
 * GollumEvent payload (Wiki pages)
 */
const GollumEventPayloadSchema = z.object({
  pages: z.array(z.object({
    page_name: z.string(),
    title: z.string(),
    summary: z.string().nullable().optional(),
    action: z.enum(['created', 'edited']),
    sha: z.string(),
    html_url: z.string(),
  })),
});

/**
 * IssueCommentEvent payload
 */
const IssueCommentEventPayloadSchema = z.object({
  action: z.enum(['created', 'edited', 'deleted']),
  changes: z.object({
    body: z.object({
      from: z.string(),
    }).optional(),
  }).optional(),
  issue: IssueSchema,
  comment: IssueCommentSchema,
});

/**
 * IssuesEvent payload
 */
const IssuesEventPayloadSchema = z.object({
  action: z.enum(['opened', 'edited', 'closed', 'reopened', 'assigned', 'unassigned', 'labeled', 'unlabeled']),
  issue: IssueSchema,
  changes: z.object({
    title: z.object({
      from: z.string(),
    }).optional(),
    body: z.object({
      from: z.string(),
    }).optional(),
  }).optional(),
  assignee: SimpleUserSchema.optional(),
  label: LabelSchema.optional(),
});

/**
 * MemberEvent payload
 */
const MemberEventPayloadSchema = z.object({
  action: z.literal('added'),
  member: SimpleUserSchema,
  changes: z.object({
    old_permission: z.object({
      from: z.string(),
    }).optional(),
  }).optional(),
});

/**
 * PublicEvent payload - When a private repository is made public
 */
const PublicEventPayloadSchema = z.object({});

/**
 * PullRequestEvent payload
 * Note: Events API returns a simplified pull_request object, not the full PR.
 */
const PullRequestEventPayloadSchema = z.object({
  action: z.enum([
    'opened', 'edited', 'closed', 'reopened', 'assigned', 'unassigned',
    'review_requested', 'review_request_removed', 'labeled', 'unlabeled', 'synchronize', 'merged'
  ]),
  number: z.number(),
  changes: z.object({
    title: z.object({
      from: z.string(),
    }).optional(),
    body: z.object({
      from: z.string(),
    }).optional(),
  }).optional(),
  pull_request: SimplePullRequestSchema,
  reason: z.string().optional(),
});

/**
 * PullRequestReviewEvent payload
 */
const PullRequestReviewEventPayloadSchema = z.object({
  action: z.literal('created'),
  pull_request: SimplePullRequestSchema,
  review: PullRequestReviewSchema,
});

/**
 * PullRequestReviewCommentEvent payload
 */
const PullRequestReviewCommentEventPayloadSchema = z.object({
  action: z.literal('created'),
  changes: z.object({
    body: z.object({
      from: z.string(),
    }).optional(),
  }).optional(),
  pull_request: SimplePullRequestSchema,
  comment: PullRequestReviewCommentSchema,
});

/**
 * PullRequestReviewThreadEvent payload
 */
const PullRequestReviewThreadEventPayloadSchema = z.object({
  action: z.enum(['resolved', 'unresolved']),
  pull_request: SimplePullRequestSchema,
  thread: z.object({
    id: z.number(),
    node_id: z.string(),
    comments: z.array(PullRequestReviewCommentSchema).optional(),
  }),
});

/**
 * PushEvent payload (Events API)
 * @see https://docs.github.com/en/rest/using-the-rest-api/github-event-types#pushevent
 *
 * Note: This schema is for the Events API, not Webhooks.
 * Webhook payloads include additional fields like commits, size, distinct_size.
 */
const PushEventPayloadSchema = z.object({
  repository_id: z.number(),
  push_id: z.number(),
  ref: z.string(),
  head: z.string(),
  before: z.string(),
});

/**
 * ReleaseEvent payload
 */
const ReleaseEventPayloadSchema = z.object({
  action: z.literal('published'),
  changes: z.object({
    body: z.object({
      from: z.string(),
    }).optional(),
    name: z.object({
      from: z.string(),
    }).optional(),
  }).optional(),
  release: ReleaseSchema,
});

/**
 * WatchEvent payload - When someone stars a repository
 */
const WatchEventPayloadSchema = z.object({
  action: z.literal('started'),
});

// ============================================================================
// Discriminated Union of All Event Types
// ============================================================================

/**
 * CommitCommentEvent
 */
export const CommitCommentEventSchema = BaseEventSchema.extend({
  type: z.literal('CommitCommentEvent'),
  payload: CommitCommentEventPayloadSchema,
});
export type CommitCommentEvent = z.infer<typeof CommitCommentEventSchema>;

/**
 * CreateEvent
 */
export const CreateEventSchema = BaseEventSchema.extend({
  type: z.literal('CreateEvent'),
  payload: CreateEventPayloadSchema,
});
export type CreateEvent = z.infer<typeof CreateEventSchema>;

/**
 * DeleteEvent
 */
export const DeleteEventSchema = BaseEventSchema.extend({
  type: z.literal('DeleteEvent'),
  payload: DeleteEventPayloadSchema,
});
export type DeleteEvent = z.infer<typeof DeleteEventSchema>;

/**
 * ForkEvent
 */
export const ForkEventSchema = BaseEventSchema.extend({
  type: z.literal('ForkEvent'),
  payload: ForkEventPayloadSchema,
});
export type ForkEvent = z.infer<typeof ForkEventSchema>;

/**
 * GollumEvent
 */
export const GollumEventSchema = BaseEventSchema.extend({
  type: z.literal('GollumEvent'),
  payload: GollumEventPayloadSchema,
});
export type GollumEvent = z.infer<typeof GollumEventSchema>;

/**
 * IssueCommentEvent
 */
export const IssueCommentEventSchema = BaseEventSchema.extend({
  type: z.literal('IssueCommentEvent'),
  payload: IssueCommentEventPayloadSchema,
});
export type IssueCommentEvent = z.infer<typeof IssueCommentEventSchema>;

/**
 * IssuesEvent
 */
export const IssuesEventSchema = BaseEventSchema.extend({
  type: z.literal('IssuesEvent'),
  payload: IssuesEventPayloadSchema,
});
export type IssuesEvent = z.infer<typeof IssuesEventSchema>;

/**
 * MemberEvent
 */
export const MemberEventSchema = BaseEventSchema.extend({
  type: z.literal('MemberEvent'),
  payload: MemberEventPayloadSchema,
});
export type MemberEvent = z.infer<typeof MemberEventSchema>;

/**
 * PublicEvent
 */
export const PublicEventSchema = BaseEventSchema.extend({
  type: z.literal('PublicEvent'),
  payload: PublicEventPayloadSchema,
});
export type PublicEvent = z.infer<typeof PublicEventSchema>;

/**
 * PullRequestEvent
 */
export const PullRequestEventSchema = BaseEventSchema.extend({
  type: z.literal('PullRequestEvent'),
  payload: PullRequestEventPayloadSchema,
});
export type PullRequestEvent = z.infer<typeof PullRequestEventSchema>;

/**
 * PullRequestReviewEvent
 */
export const PullRequestReviewEventSchema = BaseEventSchema.extend({
  type: z.literal('PullRequestReviewEvent'),
  payload: PullRequestReviewEventPayloadSchema,
});
export type PullRequestReviewEvent = z.infer<typeof PullRequestReviewEventSchema>;

/**
 * PullRequestReviewCommentEvent
 */
export const PullRequestReviewCommentEventSchema = BaseEventSchema.extend({
  type: z.literal('PullRequestReviewCommentEvent'),
  payload: PullRequestReviewCommentEventPayloadSchema,
});
export type PullRequestReviewCommentEvent = z.infer<typeof PullRequestReviewCommentEventSchema>;

/**
 * PullRequestReviewThreadEvent
 */
export const PullRequestReviewThreadEventSchema = BaseEventSchema.extend({
  type: z.literal('PullRequestReviewThreadEvent'),
  payload: PullRequestReviewThreadEventPayloadSchema,
});
export type PullRequestReviewThreadEvent = z.infer<typeof PullRequestReviewThreadEventSchema>;

/**
 * PushEvent
 */
export const PushEventSchema = BaseEventSchema.extend({
  type: z.literal('PushEvent'),
  payload: PushEventPayloadSchema,
});
export type PushEvent = z.infer<typeof PushEventSchema>;

/**
 * ReleaseEvent
 */
export const ReleaseEventSchema = BaseEventSchema.extend({
  type: z.literal('ReleaseEvent'),
  payload: ReleaseEventPayloadSchema,
});
export type ReleaseEvent = z.infer<typeof ReleaseEventSchema>;

/**
 * WatchEvent
 */
export const WatchEventSchema = BaseEventSchema.extend({
  type: z.literal('WatchEvent'),
  payload: WatchEventPayloadSchema,
});
export type WatchEvent = z.infer<typeof WatchEventSchema>;

// ============================================================================
// Union of All Event Types
// ============================================================================

/**
 * Discriminated union of all GitHub event types
 * Note: SponsorshipEvent is NOT included as it's only available as a webhook event,
 * not through the Events API
 */
export const GithubEventSchema = z.discriminatedUnion('type', [
  CommitCommentEventSchema,
  CreateEventSchema,
  DeleteEventSchema,
  ForkEventSchema,
  GollumEventSchema,
  IssueCommentEventSchema,
  IssuesEventSchema,
  MemberEventSchema,
  PublicEventSchema,
  PullRequestEventSchema,
  PullRequestReviewEventSchema,
  PullRequestReviewCommentEventSchema,
  PullRequestReviewThreadEventSchema,
  PushEventSchema,
  ReleaseEventSchema,
  WatchEventSchema,
]);

/**
 * Type for any GitHub event
 */
export type GithubEvent = z.infer<typeof GithubEventSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse and validate a single GitHub event
 */
export function parseGithubEvent(data: unknown): GithubEvent {
  return GithubEventSchema.parse(data);
}

/**
 * Parse and validate an array of GitHub events
 */
export function parseGithubEvents(data: unknown): GithubEvent[] {
  return z.array(GithubEventSchema).parse(data);
}

/**
 * Safe parse a single GitHub event (returns success/error result)
 */
export function safeParseGithubEvent(data: unknown) {
  return GithubEventSchema.safeParse(data);
}

/**
 * Safe parse an array of GitHub events (returns success/error result)
 */
export function safeParseGithubEvents(data: unknown) {
  return z.array(GithubEventSchema).safeParse(data);
}

/**
 * Type guard for specific event types
 */
export function isPushEvent(event: GithubEvent): event is PushEvent {
  return event.type === 'PushEvent';
}

export function isPullRequestEvent(event: GithubEvent): event is PullRequestEvent {
  return event.type === 'PullRequestEvent';
}

export function isIssuesEvent(event: GithubEvent): event is IssuesEvent {
  return event.type === 'IssuesEvent';
}

export function isCreateEvent(event: GithubEvent): event is CreateEvent {
  return event.type === 'CreateEvent';
}

export function isDeleteEvent(event: GithubEvent): event is DeleteEvent {
  return event.type === 'DeleteEvent';
}

export function isForkEvent(event: GithubEvent): event is ForkEvent {
  return event.type === 'ForkEvent';
}

export function isWatchEvent(event: GithubEvent): event is WatchEvent {
  return event.type === 'WatchEvent';
}

export function isMemberEvent(event: GithubEvent): event is MemberEvent {
  return event.type === 'MemberEvent';
}

export function isReleaseEvent(event: GithubEvent): event is ReleaseEvent {
  return event.type === 'ReleaseEvent';
}

export function isIssueCommentEvent(event: GithubEvent): event is IssueCommentEvent {
  return event.type === 'IssueCommentEvent';
}

export function isPullRequestReviewEvent(event: GithubEvent): event is PullRequestReviewEvent {
  return event.type === 'PullRequestReviewEvent';
}

export function isCommitCommentEvent(event: GithubEvent): event is CommitCommentEvent {
  return event.type === 'CommitCommentEvent';
}

export function isGollumEvent(event: GithubEvent): event is GollumEvent {
  return event.type === 'GollumEvent';
}

export function isPublicEvent(event: GithubEvent): event is PublicEvent {
  return event.type === 'PublicEvent';
}

export function isPullRequestReviewCommentEvent(event: GithubEvent): event is PullRequestReviewCommentEvent {
  return event.type === 'PullRequestReviewCommentEvent';
}

export function isPullRequestReviewThreadEvent(event: GithubEvent): event is PullRequestReviewThreadEvent {
  return event.type === 'PullRequestReviewThreadEvent';
}

// Re-export all schemas for convenience
export {
  ActorSchema,
  RepoSchema,
  OrgSchema,
  BaseEventSchema,
  // User schemas
  UserSchema,
  SimpleUserSchema,
  // Object schemas
  RepositorySchema,
  IssueSchema,
  PullRequestSchema,
  IssueCommentSchema,
  CommitCommentSchema,
  PullRequestReviewSchema,
  PullRequestReviewCommentSchema,
  ReleaseSchema,
  LabelSchema,
  MilestoneSchema,
  // Payload schemas
  CommitCommentEventPayloadSchema,
  CreateEventPayloadSchema,
  DeleteEventPayloadSchema,
  ForkEventPayloadSchema,
  GollumEventPayloadSchema,
  IssueCommentEventPayloadSchema,
  IssuesEventPayloadSchema,
  MemberEventPayloadSchema,
  PublicEventPayloadSchema,
  PullRequestEventPayloadSchema,
  PullRequestReviewEventPayloadSchema,
  PullRequestReviewCommentEventPayloadSchema,
  PullRequestReviewThreadEventPayloadSchema,
  PushEventPayloadSchema,
  ReleaseEventPayloadSchema,
  WatchEventPayloadSchema,
};