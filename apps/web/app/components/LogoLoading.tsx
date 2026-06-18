export function LogoLoading() {
  return (
    <div className="logo-loading-screen">
      <div className="logo-loading-icon">
        <svg
          viewBox="0 0 512 512"
          className="logo-loading-svg"
          aria-label="Loading"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#86e6cb" />
              <stop offset="100%" stopColor="#67d7bd" />
            </linearGradient>
          </defs>

          <path
            className="logo-body"
            fill="url(#logoGradient)"
            d="
              M52 398
              V212
              C52 177 76 153 111 153
              C135 153 151 163 168 184
              L239 275
              C253 293 281 293 295 275
              L353 201
              C370 180 389 172 411 179
              C439 188 460 213 460 247
              V399
              C460 429 440 449 410 449
              C380 449 360 429 360 399
              V276
              C360 266 347 262 341 270
              L302 320
              C282 346 244 346 224 320
              L181 265
              C174 256 152 260 152 274
              V398
              C152 429 132 449 102 449
              C72 449 52 429 52 398
              Z
            "
          />

          <circle
            className="logo-dot logo-dot-left"
            cx="121"
            cy="82"
            r="53"
            fill="url(#logoGradient)"
          />

          <circle
            className="logo-dot logo-dot-right"
            cx="392"
            cy="125"
            r="41"
            fill="url(#logoGradient)"
          />
        </svg>
      </div>

      <div className="logo-loading-text">Loading</div>
    </div>
  );
}
