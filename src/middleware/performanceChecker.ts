import { NextFunction } from "express";

export default function performanceChecker(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const enabled =
    process.env.PERFORMANCE_REPORTS &&
    process.env.PERFORMANCE_REPORTS === "true";

  if (!enabled) {
    next();
    return;
  }

  const minMS = process.env.PERFORMANCE_REPORTS_MIN_MS;

  if (!minMS || Number(minMS) < 1) {
    console.log(`Performance reports enabled but min ms is invalid.`);
    next();
    return;
  }

  const start = new Date().getMilliseconds();

  // @ts-ignore
  res.on("finish", function () {
    const ms = new Date().getMilliseconds() - start;

    if (ms >= Number(minMS))
      console.log(`[PERF] ${req.url}: ${ms}ms (min: ${Number(minMS)}ms)`);
  });

  next();
}
