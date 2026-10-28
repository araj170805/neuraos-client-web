import "client-only";
import * as admin from "@/lib/contracts/admin";
import * as chats from "@/lib/contracts/chats";
import { okResponseSchema } from "@/lib/contracts/common";
import * as contributions from "@/lib/contracts/contributions";
import * as files from "@/lib/contracts/files";
import * as groups from "@/lib/contracts/groups";
import * as messages from "@/lib/contracts/messages";
import * as onboarding from "@/lib/contracts/onboarding";
import * as verification from "@/lib/contracts/verification";
import { apiPath as p, apiRequest as call, validate as v } from "./request";

export { ApiError, errorMessage, uploadToTarget } from "./request";

/**
 * Typed helpers for every API route (SPEC.md section 6). The UI writes only
 * through these; reads use Firestore listeners. Each throws ApiError on failure.
 */
export const api = {
  onboarding: {
    complete: (body: onboarding.OnboardingRequest) =>
      call("POST", p("onboarding"), onboarding.onboardingResponseSchema, {
        body: v(onboarding.onboardingRequestSchema, body),
      }),
  },

  profile: {
    update: (body: onboarding.UpdateProfileRequest) =>
      call("PATCH", p("profile"), onboarding.updateProfileResponseSchema, {
        body: v(onboarding.updateProfileRequestSchema, body),
      }),
  },

  chats: {
    create: (body: chats.CreateChatRequest) =>
      call("POST", p("chats"), chats.createChatResponseSchema, {
        body: v(chats.createChatRequestSchema, body),
      }),
  },

  messages: {
    send: (chatId: string, body: messages.SendMessageRequest) =>
      call("POST", p("chats", chatId, "messages"), messages.sendMessageResponseSchema, {
        body: v(messages.sendMessageRequestSchema, body),
      }),
    retry: (chatId: string, aiMessageId: string) =>
      call("POST", p("chats", chatId, "messages", aiMessageId, "retry"), messages.retryMessageResponseSchema),
    feedback: (chatId: string, aiMessageId: string, body: messages.FeedbackRequest) =>
      call("POST", p("chats", chatId, "messages", aiMessageId, "feedback"), okResponseSchema, {
        body: v(messages.feedbackRequestSchema, body),
      }),
  },

  files: {
    uploadUrl: (chatId: string, body: files.FileUploadUrlRequest) =>
      call("POST", p("chats", chatId, "files", "upload-url"), files.fileUploadUrlResponseSchema, {
        body: v(files.fileUploadUrlRequestSchema, body),
      }),
    complete: (chatId: string, fileId: string) =>
      call("POST", p("chats", chatId, "files", fileId, "complete"), files.completeUploadResponseSchema),
    remove: (chatId: string, fileId: string) =>
      call("DELETE", p("chats", chatId, "files", fileId), okResponseSchema),
    downloadUrl: (fileId: string, query: files.FileUrlQuery) =>
      call("GET", p("files", fileId, "url"), files.fileUrlResponseSchema, {
        query: v(files.fileUrlQuerySchema, query),
      }),
  },

  groups: {
    convert: (chatId: string, body: groups.ConvertRequest) =>
      call("POST", p("chats", chatId, "convert"), groups.convertResponseSchema, {
        body: v(groups.convertRequestSchema, body),
      }),
    createInvite: (chatId: string) => call("POST", p("chats", chatId, "invite"), groups.inviteResponseSchema),
    revokeInvite: (chatId: string) => call("DELETE", p("chats", chatId, "invite"), okResponseSchema),
    join: (token: string) => call("POST", p("join", token), groups.joinResponseSchema),
    leave: (chatId: string, body: groups.LeaveRequest) =>
      call("POST", p("chats", chatId, "leave"), okResponseSchema, {
        body: v(groups.leaveRequestSchema, body),
      }),
    removeMember: (chatId: string, uid: string) =>
      call("DELETE", p("chats", chatId, "members", uid), okResponseSchema),
  },

  verification: {
    uploadUrl: (body: verification.VerificationUploadUrlRequest) =>
      call("POST", p("verification", "upload-url"), verification.verificationUploadUrlResponseSchema, {
        body: v(verification.verificationUploadUrlRequestSchema, body),
      }),
    submit: (body: verification.SubmitVerificationRequest) =>
      call("POST", p("verification"), verification.submitVerificationResponseSchema, {
        body: v(verification.submitVerificationRequestSchema, body),
      }),
  },

  contributions: {
    create: (body: contributions.CreateContributionRequest) =>
      call("POST", p("contributions"), contributions.createContributionResponseSchema, {
        body: v(contributions.createContributionRequestSchema, body),
      }),
    update: (id: string, body: contributions.UpdateContributionRequest) =>
      call("PATCH", p("contributions", id), okResponseSchema, {
        body: v(contributions.updateContributionRequestSchema, body),
      }),
    audioUrl: (id: string, body: contributions.AudioUploadUrlRequest) =>
      call("POST", p("contributions", id, "audio-url"), contributions.audioUploadUrlResponseSchema, {
        body: v(contributions.audioUploadUrlRequestSchema, body),
      }),
    transcribe: (id: string) =>
      call("POST", p("contributions", id, "transcribe"), contributions.transcribeResponseSchema),
    submit: (id: string, body: contributions.SubmitContributionRequest) =>
      call("POST", p("contributions", id, "submit"), contributions.submitContributionResponseSchema, {
        body: v(contributions.submitContributionRequestSchema, body),
      }),
  },

  admin: {
    listApplications: (query: admin.ListApplicationsQuery) =>
      call("GET", p("admin", "applications"), admin.listApplicationsResponseSchema, {
        query: v(admin.listApplicationsQuerySchema, query),
      }),
    decideApplication: (id: string, body: admin.ApplicationDecisionRequest) =>
      call("POST", p("admin", "applications", id, "decision"), admin.applicationDecisionResponseSchema, {
        body: v(admin.applicationDecisionRequestSchema, body),
      }),
    listContributions: (query: admin.ListContributionsQuery) =>
      call("GET", p("admin", "contributions"), admin.listContributionsResponseSchema, {
        query: v(admin.listContributionsQuerySchema, query),
      }),
    decideContribution: (id: string, body: admin.ContributionDecisionRequest) =>
      call("POST", p("admin", "contributions", id, "decision"), admin.contributionDecisionResponseSchema, {
        body: v(admin.contributionDecisionRequestSchema, body),
      }),
    listUsers: (query: admin.ListUsersQuery = {}) =>
      call("GET", p("admin", "users"), admin.listUsersResponseSchema, {
        query: v(admin.listUsersQuerySchema, query),
      }),
    listAuditLogs: (query: admin.ListAuditLogsQuery = {}) =>
      call("GET", p("admin", "audit-logs"), admin.listAuditLogsResponseSchema, {
        query: v(admin.listAuditLogsQuerySchema, query),
      }),
    applicationDocumentUrl: (id: string, query: admin.ApplicationDocumentUrlQuery) =>
      call("GET", p("admin", "applications", id, "document-url"), admin.adminDownloadUrlResponseSchema, {
        query: v(admin.applicationDocumentUrlQuerySchema, query),
      }),
    contributionAudioUrl: (id: string) =>
      call("GET", p("admin", "contributions", id, "audio-url"), admin.adminDownloadUrlResponseSchema),
    updateConfig: (body: admin.UpdateConfigRequest) =>
      call("PATCH", p("admin", "config"), admin.updateConfigResponseSchema, {
        body: v(admin.updateConfigRequestSchema, body),
      }),
  },
};
