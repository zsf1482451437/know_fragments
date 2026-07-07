import { describe, expect, it } from "vitest";
import { sampleJobs } from "@/data/sampleJobs";
import {
  applicationStatusLabel,
  getStageTier,
  isStatusAtOrAfter,
  normalizeSalaryText,
  parseSalaryText,
  statusOptions,
} from "@/services/jobRules";

describe("jobRules", () => {
  it("maps company stage to default tier", () => {
    expect(getStageTier("no_financing")).toBe("practice");
    expect(getStageTier("angel")).toBe("practice");
    expect(getStageTier("series_a")).toBe("practice");
    expect(getStageTier("series_b")).toBe("fit");
    expect(getStageTier("series_c")).toBe("fit");
    expect(getStageTier("series_d")).toBe("target");
    expect(getStageTier("listed")).toBe("target");
  });

  it("parses salary text", () => {
    expect(parseSalaryText("25-40k")).toMatchObject({
      salaryMinK: 25,
      salaryMaxK: 40,
    });
  });

  it("normalizes numeric salary text to k by default", () => {
    expect(normalizeSalaryText("25-40")).toBe("25-40k");
    expect(normalizeSalaryText("25")).toBe("25k");
    expect(normalizeSalaryText("25k-40k")).toBe("25-40k");
  });

  it("keeps communicated status before applied", () => {
    expect(statusOptions.slice(0, 3)).toEqual(["pending_apply", "communicated", "applied"]);
    expect(applicationStatusLabel.communicated).toBe("已沟通");
    expect(applicationStatusLabel.offer).toBe("offer");
  });

  it("matches jobs that have reached the selected progress node", () => {
    expect(isStatusAtOrAfter("pending_apply", "pending_apply")).toBe(true);
    expect(isStatusAtOrAfter("communicated", "pending_apply")).toBe(false);
    expect(isStatusAtOrAfter("communicated", "communicated")).toBe(true);
    expect(isStatusAtOrAfter("applied", "communicated")).toBe(true);
    expect(isStatusAtOrAfter("pending_apply", "communicated")).toBe(false);
  });

  it("keeps sample jobs with application status", () => {
    expect(sampleJobs.length).toBe(25);
    expect(sampleJobs.every((job) => job.applicationStatus)).toBe(true);
  });

  it("keeps all source indexes from the imported JD file", () => {
    expect(sampleJobs.map((job) => job.sourceIndex)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1),
    );
  });

  it("uses raw JD text from the source txt file", () => {
    expect(sampleJobs[0].jdRaw).toContain("本科及以上学历");
    expect(sampleJobs[1].jdRaw).not.toContain("--2 星火无限 不需要融资");
    expect(sampleJobs[1].jdRaw).not.toContain("26-45k");
    expect(sampleJobs[1].jdRaw).toContain("熟悉Claude Code、Codex等Al开发工具");
    expect(sampleJobs[1].jdRaw).toContain("持续关注并实践AI编程的前沿方法");
    expect(sampleJobs[7].jdRaw).toContain("岗位要求");
  });
});
