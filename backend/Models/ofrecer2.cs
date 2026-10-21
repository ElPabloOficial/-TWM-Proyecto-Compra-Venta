using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class ofrecer2
{
    public string id_usuario { get; set; } = null!;

    public int id_servicio { get; set; }

    public string tipobien { get; set; } = null!;

    public virtual servicio id_servicioNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
