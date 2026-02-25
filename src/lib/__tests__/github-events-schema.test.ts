import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import {
  safeParseGithubEvents,
  safeParseGithubEvent,
} from "../github-events-schema";

const sampleEvents = JSON.parse(
  readFileSync(join(__dirname, "fixtures/sample-events.json"), "utf-8"),
);

describe("github-events-schema", () => {
  describe("safeParseGithubEvents", () => {
    it("should parse all sample events successfully", () => {
      const result = safeParseGithubEvents(sampleEvents);
      if (!result.success) {
        const errors = result.error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        expect.fail(
          `Parse failed with ${errors.length} errors:\n${JSON.stringify(errors, null, 2)}`,
        );
      }
      expect(result.data).toHaveLength(sampleEvents.length);
    });
  });

  describe("safeParseGithubEvent", () => {
    for (const event of sampleEvents) {
      it(`should parse ${event.type} (id: ${event.id})`, () => {
        const result = safeParseGithubEvent(event);
        if (!result.success) {
          const errors = result.error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          }));
          expect.fail(
            `Failed to parse ${event.type}:\n${JSON.stringify(errors, null, 2)}`,
          );
        }
        expect(result.data.type).toBe(event.type);
        expect(result.data.id).toBe(event.id);
      });
    }
  });

  describe("PullRequestReviewEvent", () => {
    it("should accept a minimal pull_request object", () => {
      const event = {
        id: "test-1",
        type: "PullRequestReviewEvent",
        actor: {
          id: 1,
          login: "testuser",
          display_login: "testuser",
          gravatar_id: "",
          url: "https://api.github.com/users/testuser",
          avatar_url: "https://avatars.githubusercontent.com/u/1?",
        },
        repo: {
          id: 1,
          name: "test/repo",
          url: "https://api.github.com/repos/test/repo",
        },
        payload: {
          action: "created",
          pull_request: {
            url: "https://api.github.com/repos/test/repo/pulls/1",
            id: 1,
            number: 1,
            head: {
              ref: "feature",
              sha: "abc123",
              repo: { id: 1, url: "https://api.github.com/repos/test/repo", name: "repo" },
            },
            base: {
              ref: "main",
              sha: "def456",
              repo: { id: 1, url: "https://api.github.com/repos/test/repo", name: "repo" },
            },
          },
          review: {
            id: 1,
            node_id: "PRR_1",
            user: null,
            body: null,
            state: "approved",
            html_url: "https://github.com/test/repo/pull/1#pullrequestreview-1",
            pull_request_url: "https://api.github.com/repos/test/repo/pulls/1",
            _links: {
              html: { href: "https://github.com/test/repo/pull/1#pullrequestreview-1" },
              pull_request: { href: "https://api.github.com/repos/test/repo/pulls/1" },
            },
            submitted_at: "2025-01-01T00:00:00Z",
            commit_id: "abc123",
          },
        },
        public: true,
        created_at: "2025-01-01T00:00:00Z",
      };

      const result = safeParseGithubEvent(event);
      if (!result.success) {
        const errors = result.error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        expect.fail(
          `Failed to parse:\n${JSON.stringify(errors, null, 2)}`,
        );
      }
      expect(result.data.type).toBe("PullRequestReviewEvent");
    });

    it("should accept review without author_association", () => {
      const event = {
        id: "test-2",
        type: "PullRequestReviewEvent",
        actor: {
          id: 1,
          login: "testuser",
          display_login: "testuser",
          gravatar_id: "",
          url: "https://api.github.com/users/testuser",
          avatar_url: "https://avatars.githubusercontent.com/u/1?",
        },
        repo: {
          id: 1,
          name: "test/repo",
          url: "https://api.github.com/repos/test/repo",
        },
        payload: {
          action: "created",
          pull_request: {
            url: "https://api.github.com/repos/test/repo/pulls/1",
            id: 1,
            number: 1,
            head: {
              ref: "feature",
              sha: "abc123",
              repo: null,
            },
            base: {
              ref: "main",
              sha: "def456",
              repo: null,
            },
          },
          review: {
            id: 1,
            node_id: "PRR_1",
            user: null,
            body: null,
            state: "approved",
            html_url: "https://github.com/test/repo/pull/1#pullrequestreview-1",
            pull_request_url: "https://api.github.com/repos/test/repo/pulls/1",
            _links: {
              html: { href: "https://github.com/test/repo/pull/1#pullrequestreview-1" },
              pull_request: { href: "https://api.github.com/repos/test/repo/pulls/1" },
            },
            commit_id: "abc123",
          },
        },
        public: true,
        created_at: "2025-01-01T00:00:00Z",
      };

      const result = safeParseGithubEvent(event);
      expect(result.success).toBe(true);
    });
  });
});
