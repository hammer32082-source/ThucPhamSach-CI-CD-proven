using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ThucPhamSach_Backend.Hubs;

[Authorize]
public class OrderHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var roles = Context.User?.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToList();

        if (roles != null && roles.Contains("Admin"))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "AdminGroup");
        }
        else if (roles != null && roles.Contains("KhachHang"))
        {
            var maKh = Context.User?.FindFirstValue("maKH");
            if (!string.IsNullOrEmpty(maKh))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"CustomerGroup_{maKh}");
            }
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var roles = Context.User?.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToList();

        if (roles != null && roles.Contains("Admin"))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AdminGroup");
        }
        else if (roles != null && roles.Contains("KhachHang"))
        {
            var maKh = Context.User?.FindFirstValue("maKH");
            if (!string.IsNullOrEmpty(maKh))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"CustomerGroup_{maKh}");
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}
