using System.Web;
using System.Web.Optimization;

namespace ReactorJS
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/lib/jquery").Include(
                "~/Scripts/Library/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/lib/underscore").Include(
                "~/Scripts/Library/underscore.js"));

            bundles.Add(new ScriptBundle("~/lib/knockout").Include(
                "~/Scripts/Library/knockout-{version}.js"));

            bundles.Add(new ScriptBundle("~/src/app").Include(
                "~/Scripts/Utils/*.js",
                "~/Scripts/Reactor/Base/*.js",
                "~/Scripts/Reactor/*.js",
                "~/Scripts/Reactor/EngineComponents/*.js",
                "~/Scripts/Reactor/AppComponents/*.js",
                "~/Scripts/App/Base/*.js",
                "~/Scripts/App/Components/*.js",
                "~/Scripts/App/*.js"));

            bundles.Add(new StyleBundle("~/css/site").Include(
                "~/Content/site.css"));
        }
    }
}