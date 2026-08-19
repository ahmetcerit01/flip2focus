#!/usr/bin/env ruby
# One-time script that adds the Flip2FocusMonitor (DeviceActivityMonitor)
# and Flip2FocusShield (ManagedSettingsUI ShieldConfiguration) app extension
# targets to the generated Xcode project. Run exactly once against a fresh
# `expo prebuild` output, then commit ios/. Re-running against a project
# that already has manual Xcode edits (dangling target dependency proxies
# in particular) is not safe — xcodeproj's dependency bookkeeping does not
# clean up reliably. If you need to change these targets, regenerate via
# `expo prebuild --platform ios` (only safe because no other manual native
# changes exist yet) and re-run this script once.
require 'xcodeproj'

project_path = File.join(__dir__, 'Flip2Focus.xcodeproj')
project = Xcodeproj::Project.open(project_path)

main_target = project.targets.find { |t| t.name == 'Flip2Focus' }
raise "Main app target not found" unless main_target

BUNDLE_ID_PREFIX = 'com.ahmetcerit.flip2focus'
DEPLOYMENT_TARGET = '16.4'
DEVELOPMENT_TEAM = ENV['FLIP2FOCUS_DEVELOPMENT_TEAM'] || ''
SHARED_SOURCE = File.join(__dir__, '..', 'modules', 'flip2focus-screen-time', 'ios', 'Flip2FocusShared.swift')

def configure_common_build_settings(target, bundle_id, entitlements_relative_path)
  target.build_configurations.each do |config|
    config.build_settings['PRODUCT_NAME'] = target.name
    config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = bundle_id
    config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = DEPLOYMENT_TARGET
    config.build_settings['SWIFT_VERSION'] = '5.9'
    config.build_settings['CODE_SIGN_ENTITLEMENTS'] = entitlements_relative_path
    config.build_settings['CODE_SIGN_STYLE'] = 'Automatic'
    config.build_settings['DEVELOPMENT_TEAM'] = DEVELOPMENT_TEAM
    config.build_settings['TARGETED_DEVICE_FAMILY'] = '1'
    config.build_settings['SKIP_INSTALL'] = 'YES'
    config.build_settings['MARKETING_VERSION'] = '1.0.0'
    config.build_settings['CURRENT_PROJECT_VERSION'] = '1'
    config.build_settings['GENERATE_INFOPLIST_FILE'] = 'NO'
  end
end

# ---------------------------------------------------------------------------
# Flip2FocusMonitor (DeviceActivityMonitor extension)
# ---------------------------------------------------------------------------
monitor_group = project.main_group.find_subpath('Flip2FocusMonitor', true)
monitor_group.set_source_tree('SOURCE_ROOT')
monitor_group.set_path('Flip2FocusMonitor')

monitor_swift_ref = monitor_group.new_reference('Flip2FocusMonitor.swift')
monitor_shared_ref = monitor_group.new_reference(SHARED_SOURCE)
monitor_group.new_reference('Info.plist')
monitor_group.new_reference('Flip2FocusMonitor.entitlements')

monitor_target = project.new_target(:app_extension, 'Flip2FocusMonitor', :ios, DEPLOYMENT_TARGET)
monitor_target.add_file_references([monitor_swift_ref, monitor_shared_ref])
configure_common_build_settings(
  monitor_target,
  "#{BUNDLE_ID_PREFIX}.DeviceActivityMonitor",
  'Flip2FocusMonitor/Flip2FocusMonitor.entitlements'
)
monitor_target.build_configurations.each do |config|
  config.build_settings['INFOPLIST_FILE'] = 'Flip2FocusMonitor/Info.plist'
end

# ---------------------------------------------------------------------------
# Flip2FocusShield (ManagedSettingsUI ShieldConfiguration extension)
# ---------------------------------------------------------------------------
shield_group = project.main_group.find_subpath('Flip2FocusShield', true)
shield_group.set_source_tree('SOURCE_ROOT')
shield_group.set_path('Flip2FocusShield')

shield_swift_ref = shield_group.new_reference('ShieldConfigurationExtension.swift')
shield_shared_ref = shield_group.new_reference(SHARED_SOURCE)
shield_group.new_reference('Info.plist')
shield_group.new_reference('Flip2FocusShield.entitlements')
shield_assets_ref = shield_group.new_reference('Assets.xcassets')

shield_target = project.new_target(:app_extension, 'Flip2FocusShield', :ios, DEPLOYMENT_TARGET)
shield_target.add_file_references([shield_swift_ref, shield_shared_ref])
shield_target.add_resources([shield_assets_ref])
configure_common_build_settings(
  shield_target,
  "#{BUNDLE_ID_PREFIX}.ShieldConfiguration",
  'Flip2FocusShield/Flip2FocusShield.entitlements'
)
shield_target.build_configurations.each do |config|
  config.build_settings['INFOPLIST_FILE'] = 'Flip2FocusShield/Info.plist'
end

# ---------------------------------------------------------------------------
# Wire both extensions into the main app: target dependency + embed phase
# ---------------------------------------------------------------------------
embed_phase = main_target.new_copy_files_build_phase('Embed Foundation Extensions')
embed_phase.dst_subfolder_spec = '13' # PlugIns
embed_phase.symbol_dst_subfolder_spec = :plug_ins

[monitor_target, shield_target].each do |ext_target|
  main_target.add_dependency(ext_target)
  embed_file = embed_phase.add_file_reference(ext_target.product_reference, true)
  embed_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
end

# Main app also needs its own entitlements pointed at explicitly (prebuild
# already generated Flip2Focus/Flip2Focus.entitlements with the right
# content; just make sure every config references it).
main_target.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'Flip2Focus/Flip2Focus.entitlements'
end

project.save
puts 'Added Flip2FocusMonitor and Flip2FocusShield targets.'
